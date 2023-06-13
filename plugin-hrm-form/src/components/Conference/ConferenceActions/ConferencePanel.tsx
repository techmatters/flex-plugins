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
import { Manager, TaskContextProps, TaskHelper, withTaskContext } from '@twilio/flex-ui';
import AddIcCallRounded from '@material-ui/icons/AddIcCallRounded';

import { conferenceApi } from '../../../services/ServerlessService';
import PhoneInputDialog from './PhoneInputDialog';
import { StyledConferenceButtonWrapper, StyledConferenceButton } from './styles';

type Props = TaskContextProps;

const ConferencePanel: React.FC<Props> = ({ task, conference }) => {
  const [targetNumber, setTargetNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const conferenceSid = conference?.source?.conferenceSid;
  const participants = conference?.source?.participants || [];

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  const handleClick = async () => {
    setIsAdding(true);
    const from = Manager.getInstance().serviceConfiguration.outbound_call_flows.default.caller_id;
    const to = targetNumber;
    await conferenceApi.addParticipant({ from, conferenceSid, to });

    setIsAdding(false);
    setIsDialogOpen(false);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  if (!conferenceSid || !participants || !task) {
    return null;
  }

  return (
    <StyledConferenceButtonWrapper>
      <>
        <StyledConferenceButton
          disabled={
            !isLiveCall ||
            isAdding ||
            (participants && participants.filter(participant => participant.status === 'joined').length >= 3)
          }
          onClick={toggleDialog}
        >
          <AddIcCallRounded />
        </StyledConferenceButton>
        {isDialogOpen && (
          <PhoneInputDialog
            targetNumber={targetNumber}
            setTargetNumber={setTargetNumber}
            handleClick={handleClick}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
      </>
      <span>Conference</span>
    </StyledConferenceButtonWrapper>
  );
};

export default withTaskContext(ConferencePanel);
