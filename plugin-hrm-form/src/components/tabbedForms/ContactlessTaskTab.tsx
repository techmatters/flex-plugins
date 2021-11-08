/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FieldError, useFormContext } from 'react-hook-form';
import { isFuture } from 'date-fns';
import { get } from 'lodash';

import { createFormFromDefinition, disperseInputs } from '../common/forms/formGenerators';
import { updateForm } from '../../states/contacts/actions';
import { Container, ColumnarBlock, TwoColumnLayout, TabbedFormTabContainer } from '../../styles/HrmStyles';
import { configurationBase, namespace, RootState } from '../../states';
import type { TaskEntry } from '../../states/contacts/reducer';
import { createContactlessTaskTabDefinition } from './ContactlessTaskTabDefinition';
import { splitDate, splitTime } from '../../utils/helpers';
import type { OfflineContactTask } from '../../types/types';
import type { HelplineDefinitions } from '../common/forms/types';

type OwnProps = {
  task: OfflineContactTask;
  display: boolean;
  definition: HelplineDefinitions;
  initialValues: TaskEntry[keyof TaskEntry];
  autoFocus: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactlessTaskTab: React.FC<Props> = ({
  dispatch,
  display,
  task,
  definition,
  initialValues,
  counselorsList,
  autoFocus,
}) => {
  const [initialForm] = React.useState(initialValues); // grab initial values in first render only. This value should never change or will ruin the memoization below

  const { getValues, register, setError, setValue, watch, errors } = useFormContext();

  const contactlessTaskForm = React.useMemo(() => {
    const updateCallBack = () => {
      const { isFutureAux, ...rest } = getValues().contactlessTask;
      dispatch(updateForm(task.taskSid, 'contactlessTask', rest));
    };

    const formDefinition = createContactlessTaskTabDefinition(counselorsList, definition);

    const tab = createFormFromDefinition(formDefinition, autoFocus)(['contactlessTask'])(initialForm)(updateCallBack);

    return disperseInputs(5)(tab);
  }, [counselorsList, dispatch, getValues, definition, initialForm, autoFocus, task.taskSid]);

  // Add invisible field that errors if date + time are future (triggered by validaiton)
  React.useEffect(() => {
    register('contactlessTask.isFutureAux', {
      validate: () => {
        const { contactlessTask } = getValues();
        const { date, time } = contactlessTask;
        if (date && time) {
          const [y, m, d] = splitDate(date);
          const [mm, hh] = splitTime(time);
          if (isFuture(new Date(y, m - 1, d, mm, hh))) {
            return 'TimeCantBeGreaterThanNow'; // return non-null to generate an error, using the localized error key
          }
        }

        return null;
      },
    });
  }, [getValues, register, setError]);

  // Replicate error in time if there is error in isFutureAux
  const isFutureError: FieldError = get(errors, 'contactlessTask.isFutureAux');
  React.useEffect(() => {
    if (isFutureError) setError('contactlessTask.time', { message: isFutureError.message, type: 'isFutureAux' });
  }, [isFutureError, setError]);

  const time = watch('contactlessTask.time');
  // Set isFutureAux (triggered by time onChange) so it's revalidated (this makes sense after 1st submission attempt)
  React.useEffect(() => {
    setValue('contactlessTask.isFutureAux', time, { shouldValidate: true });
  }, [setValue, time]);

  if (!display) return null;

  return (
    <TabbedFormTabContainer display={display}>
      <Container>
        <TwoColumnLayout>
          <ColumnarBlock>{contactlessTaskForm}</ColumnarBlock>
          <ColumnarBlock />
        </TwoColumnLayout>
      </Container>
    </TabbedFormTabContainer>
  );
};

ContactlessTaskTab.displayName = 'ContactlessTaskTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  counselorsList: state[namespace][configurationBase].counselors.list,
});

const connector = connect(mapStateToProps);
const connected = connector(ContactlessTaskTab);

export default connected;
