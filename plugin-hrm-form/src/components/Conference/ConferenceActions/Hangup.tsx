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

import React from 'react';
import { TaskContextProps, TaskHelper, withTaskContext } from '@twilio/flex-ui';
import { CallEnd as CallEndIcon } from '@material-ui/icons';

import { conferenceApi } from '../../../services/ServerlessService';
import { StyledConferenceButtonWrapper, StyledConferenceButton } from './styles';

type Props = TaskContextProps;

const Hangup: React.FC<Props> = ({ call, task }) => {
  if (!task || !call) {
    return null;
  }

  const handleClick = async () => {
    await conferenceApi.removeParticipant({
      callSid: call?.parameters?.CallSid,
      conferenceSid: task?.attributes?.conference?.sid,
    });
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <StyledConferenceButtonWrapper>
      <StyledConferenceButton color="#fff" backgroundColor="#c81c25" disabled={!isLiveCall} onClick={handleClick}>
        <CallEndIcon />
      </StyledConferenceButton>
      <span>Hang Up</span>
    </StyledConferenceButtonWrapper>
  );
};

export default withTaskContext(Hangup);
