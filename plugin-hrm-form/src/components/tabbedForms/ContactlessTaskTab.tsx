/* eslint-disable react/prop-types */
import React from 'react';
import { ITask, withTaskContext } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { isFuture } from 'date-fns';

import { createFormFromDefinition } from '../common/forms/formGenerators';
import { updateContactLessTask } from '../../states/ContactState';
import { Container, ColumnarBlock, TwoColumnLayout, Box } from '../../styles/HrmStyles';
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
  const { getValues, setError, watch, errors } = useFormContext();

  const contactlessTaskForm = React.useMemo(() => {
    const updateCallBack = () => {
      const { contactlessTask } = getValues();
      dispatch(updateContactLessTask(contactlessTask, task.taskSid));
    };
    return createFormFromDefinition(formDefinition)(['contactlessTask'])(updateCallBack).map(i => (
      <Box key={`${i.key}-wrapping-box`} marginTop="5px" marginBottom="5px">
        {i}
      </Box>
    ));
  }, [dispatch, getValues, task.taskSid]);

  const date = watch('contactlessTask.date');
  const time = watch('contactlessTask.time');

  React.useEffect(() => {
    if (date && time) {
      const [y, m, d] = splitDate(date);
      const [mm, hh] = splitTime(time);
      if (isFuture(new Date(y, m - 1, d, mm, hh)))
        setError('contactlessTask.time', { message: 'TimeCantBeGreaterThanNow' });
    }
  }, [date, errors, setError, time]);

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
