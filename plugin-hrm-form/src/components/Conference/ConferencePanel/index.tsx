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
import { Button, Manager, TaskContextProps, TaskHelper, withTaskContext } from '@twilio/flex-ui';
import AddIcCallRounded from '@material-ui/icons/AddIcCallRounded';

import { conferenceApi } from '../../../services/ServerlessService';
import PhoneInputDialog from './PhoneInputDialog';
import { Column } from '../../../styles/HrmStyles';

type Props = TaskContextProps;

const ConferencePanel: React.FC<Props> = ({ task, conference }) => {
  const [targetNumber, setTargetNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

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
    setIsDialogOpen(false);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <form>
      <Column>
        <Button
          style={{ borderStyle: 'none', borderRadius: '50%', minWidth: 'auto' }}
          disabled={!isLiveCall || isAdding}
          onClick={toggleDialog}
          variant="secondary"
          // title={}
        >
          <AddIcCallRounded />
        </Button>
        {isDialogOpen && (
          <PhoneInputDialog
            targetNumber={targetNumber}
            setTargetNumber={setTargetNumber}
            handleClick={handleClick}
            setIsDialogOpen={setIsDialogOpen}
          />
        )}
        <span>Conference</span>
      </Column>
    </form>
  );
};

export default withTaskContext(ConferencePanel);
