/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { FieldError, useFormContext } from 'react-hook-form';
import { isFuture } from 'date-fns';
import { get } from 'lodash';
import { useFlexSelector } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';

import { disperseInputs } from '../common/forms/formGenerators';
import { useCreateFormFromDefinition } from '../common/forms/formGenerator';
import { updateForm } from '../../states/contacts/actions';
import { Container, ColumnarBlock, TwoColumnLayout, ColumnarContent } from '../../styles/HrmStyles';
import { configurationBase, namespace, RootState } from '../../states';
import { selectWorkerSid } from '../../states/selectors/flexSelectors';
import type { TaskEntry } from '../../states/contacts/reducer';
import { createContactlessTaskTabDefinition } from './ContactlessTaskTabDefinition';
import { splitDate, splitTime } from '../../utils/helpers';
import type { OfflineContactTask } from '../../types/types';

type OwnProps = {
  task: OfflineContactTask;
  display: boolean;
  helplineInformation: DefinitionVersion['helplineInformation'];
  definition: DefinitionVersion['tabbedForms']['ContactlessTaskTab'];
  initialValues: TaskEntry['contactlessTask'];
  autoFocus: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactlessTaskTab: React.FC<Props> = ({
  dispatch,
  display,
  task,
  helplineInformation,
  definition,
  initialValues,
  counselorsList,
  autoFocus,
}) => {
  const { getValues, register, setError, setValue, watch, errors } = useFormContext();

  const workerSid = useFlexSelector(selectWorkerSid);

  const formDefinition = React.useMemo(
    () => createContactlessTaskTabDefinition({ counselorsList, helplineInformation, definition }),
    [counselorsList, definition, helplineInformation],
  );

  const form = useCreateFormFromDefinition({
    definition: formDefinition,
    initialValues: {
      ...initialValues,
      createdOnBehalfOf: initialValues.createdOnBehalfOf || workerSid, // If no createdOnBehalfOf comming from state, we want the current counselor to be the default
    },
    parentsPath: 'contactlessTask',
    updateCallback: () => {
      const { isFutureAux, ...rest } = getValues().contactlessTask;
      dispatch(updateForm(task.taskSid, 'contactlessTask', rest));
    },
    shouldFocusFirstElement: display && autoFocus,
  });

  const contactlessTaskForm = disperseInputs(5)(form);

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

  return (
    <Container>
      <TwoColumnLayout>
        <ColumnarBlock>
          <ColumnarContent>{contactlessTaskForm}</ColumnarContent>
        </ColumnarBlock>
        <ColumnarBlock />
      </TwoColumnLayout>
    </Container>
  );
};

ContactlessTaskTab.displayName = 'ContactlessTaskTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  counselorsList: state[namespace][configurationBase].counselors.list,
});

const connector = connect(mapStateToProps);
const connected = connector(ContactlessTaskTab);

export default connected;
