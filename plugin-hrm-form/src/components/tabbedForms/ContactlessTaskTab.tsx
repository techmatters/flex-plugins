/* eslint-disable react/prop-types */
import React from 'react';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { FieldError, useFormContext } from 'react-hook-form';
import { isFuture } from 'date-fns';
import { get } from 'lodash';

import { createFormFromDefinition } from '../common/forms/formGenerators';
import { updateContactLessTask } from '../../states/ContactState';
import { Container, ColumnarBlock, TwoColumnLayout, Box, FormError } from '../../styles/HrmStyles';
import type { RootState } from '../../states';
import { formDefinition } from './ContactlessTaskTabDefinition';
import { splitDate, splitTime } from '../../utils/helpers';

type OwnProps = {
  task: ITask;
  display: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactlessTaskTab: React.FC<Props> = ({ dispatch, display, task }) => {
  const { getValues, register, setError, trigger, watch, errors } = useFormContext();

  const contactlessTaskForm = React.useMemo(() => {
    const updateCallBack = () => {
      const { isFutureAux, ...contactlessTask } = getValues().contactlessTask;
      dispatch(updateContactLessTask(contactlessTask, task.taskSid));
    };
    return createFormFromDefinition(formDefinition)(['contactlessTask'])(updateCallBack).map(i => (
      <Box key={`${i.key}-wrapping-box`} marginTop="5px" marginBottom="5px">
        {i}
      </Box>
    ));
  }, [dispatch, getValues, task.taskSid]);

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

  const date = watch('contactlessTask.date');
  const time = watch('contactlessTask.time');

  // Trigger validation on isFutureAux (triggered by date or time onChange)
  React.useEffect(() => {
    trigger('contactlessTask.isFutureAux');
  }, [date, time, trigger]);

  // Replicate error in time if there is error in isFutureAux
  const isFutureError: FieldError = get(errors, 'contactlessTask.isFutureAux');
  React.useEffect(() => {
    if (isFutureError) setError('contactlessTask.time', { message: isFutureError.message });
  }, [isFutureError, setError]);

  return (
    <div style={{ height: '100%', display: display ? 'block' : 'none' }}>
      <Container>
        <TwoColumnLayout>
          <ColumnarBlock>{contactlessTaskForm}</ColumnarBlock>
          <ColumnarBlock />
        </TwoColumnLayout>
      </Container>
    </div>
  );
};

ContactlessTaskTab.displayName = 'ContactlessTaskTab';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({});

const connector = connect(mapStateToProps);
const connected = connector(ContactlessTaskTab);

export default withTaskContext<Props, typeof connected>(connected);
