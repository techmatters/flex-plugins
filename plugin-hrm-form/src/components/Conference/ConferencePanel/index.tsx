import React, { useState } from 'react';
import { IconButton, Manager, TaskContextProps, TaskHelper, Template, withTaskContext } from '@twilio/flex-ui';

import { Column } from '../../../styles/HrmStyles';
import { conferenceApi } from '../../../services/ServerlessService';

type Props = TaskContextProps;

const ConferencePanel: React.FC<Props> = ({ task, conference }) => {
  const [targetNumber, setTargetNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!conference?.source?.conferenceSid || !task) {
    return null;
  }

  const { conferenceSid } = conference.source;

  const handleClick = async () => {
    setIsAdding(true);
    const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    const to = targetNumber;
    const result = await conferenceApi.addParticipant({ from, conferenceSid, to });
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

export default withTaskContext(ConferencePanel);
