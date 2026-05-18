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
import { Actions, TaskContextProps, TaskHelper, Template, withTaskContext, Manager } from '@twilio/flex-ui';
import { CallEndOutlined as CallEndIcon } from '@material-ui/icons';

import { ConferenceButtonWrapper, HangUpButton } from './styles';

type Props = TaskContextProps;

const Hangup: React.FC<Props> = ({ call, task, conference }) => {
  const participants = conference?.source?.participants || [];

  if (!task || !call || participants.length === 0) {
    return null;
  }

  const handleClick = async () => {
    await Actions.invokeAction('HangupCall', { task });
  };

  const isLiveCall = TaskHelper.isLiveCall(task);
  const { strings } = Manager.getInstance();
  const HANG_UP_KEY = 'Conference-Actions-Hangup';
  const LEAVE_CALL_KEY = 'Conference-Actions-Leave';
  const isMoreThan2CallParticipants =
    participants && participants.filter(participant => participant.status === 'joined').length > 2;

  return (
    <ConferenceButtonWrapper>
      <HangUpButton
        aria-label={strings[isMoreThan2CallParticipants ? LEAVE_CALL_KEY : HANG_UP_KEY]}
        disabled={!isLiveCall}
        onClick={handleClick}
      >
        <CallEndIcon />
      </HangUpButton>
      <span>{isMoreThan2CallParticipants ? <Template code={HANG_UP_KEY} /> : <Template code={LEAVE_CALL_KEY} />}</span>
    </ConferenceButtonWrapper>
  );
};

export default withTaskContext(Hangup);
