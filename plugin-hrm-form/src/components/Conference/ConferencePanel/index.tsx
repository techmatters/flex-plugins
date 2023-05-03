import React, { useState } from 'react';
import { IconButton, Manager, TaskContextProps, TaskHelper, Template, withTaskContext } from '@twilio/flex-ui';

import { Column } from '../../../styles/HrmStyles';
import { conferenceApi } from '../../../services/ServerlessService';

type Props = TaskContextProps;

const ConferenceButton: React.FC<Props> = ({ task }) => {
  const [targetNumber, setTargetNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = async () => {
    setIsAdding(true);
    const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    const to = targetNumber;
    const { taskSid } = task;
    const result = await conferenceApi.addParticipant({ from, taskSid, to });
    console.log('>>>>>>> addConferenceParticipant resulted on:', result);
    setIsAdding(false);
  };

  const handleNumberChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setTargetNumber(e.target.value);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <form>
      <Column>
        <label htmlFor="number-input">
          <Template code="Phone number" />
          <input type="text" id="number-input" value={targetNumber} onChange={handleNumberChange} />
        </label>
        <IconButton
          icon={isAdding ? 'Loading' : 'Add'}
          disabled={!isLiveCall || isAdding}
          onClick={handleClick}
          variant="secondary"
          // title={}
        />
      </Column>
    </form>
  );
};

export default withTaskContext(ConferenceButton);
