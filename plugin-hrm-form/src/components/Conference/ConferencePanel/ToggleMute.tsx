/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React, { useState } from 'react';
import { Button, TaskContextProps, TaskHelper, withTaskContext } from '@twilio/flex-ui';
import MicNoneOutlined from '@material-ui/icons/MicNoneOutlined';
import MicOffOutlined from '@material-ui/icons/MicOffOutlined';

import { conferenceApi } from '../../../services/ServerlessService';
import { Column } from '../../../styles/HrmStyles';

type Props = TaskContextProps;

const ToggleMute: React.FC<Props> = ({ call, task, conference }) => {
  const [isMuted, setIsMuted] = useState(false);

  if (!task || !call || !conference) {
    return null;
  }

  const handleClick = async () => {
    const { participants } = conference?.source;
    const workerParticipant = participants.find(participant => participant.isCurrentWorker === true);

    if (workerParticipant) {
      const currentMutedState = workerParticipant.muted;
      const toggleMute = !currentMutedState;

      const result = await conferenceApi.updateParticipant({
        callSid: call?.parameters?.CallSid,
        conferenceSid: task?.attributes?.conference?.sid,
        updateAttribute: 'muted',
        updateValue: toggleMute,
      });

      console.log('>>> handleClick workerParticipant muted', result);
      setIsMuted(toggleMute);
    }
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <Column>
      <Button
        style={{ borderStyle: 'none', borderRadius: '50%', minWidth: 'auto' }}
        disabled={!isLiveCall}
        onClick={handleClick}
        variant="secondary"
        // title={}
      >
        {isMuted ? <MicOffOutlined /> : <MicNoneOutlined />}
      </Button>
      <span>Microphone</span>
    </Column>
  );
};

export default withTaskContext(ToggleMute);
