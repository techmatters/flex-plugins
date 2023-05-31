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
import { Button, Manager, TaskContextProps, TaskHelper, Template, withTaskContext } from '@twilio/flex-ui';
import AddIcCallRounded from '@material-ui/icons/AddIcCallRounded';
import { Phone } from '@material-ui/icons';

import { Column } from '../../../styles/HrmStyles';
import { conferenceApi } from '../../../services/ServerlessService';
import { PhoneDialog, DialogArrow } from './style';

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
  };

  const handleNumberChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setTargetNumber(e.target.value);
  };

  const isLiveCall = TaskHelper.isLiveCall(task);

  return (
    <form>
      <Column>
        {/* <label htmlFor="number-input">
          <Template code="Phone number" />
          <input type="text" id="number-input" value={targetNumber} onChange={handleNumberChange} />
        </label> */}
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
          <PhoneDialog>
            <DialogArrow />
            <Template code='AddConferenceCallParticipant'/>

            {/* http://catamphetamine.github.io/react-phone-number-input/ */}
            <label htmlFor="number-input">
              <Template code="Enter Phone number" /> <br />
              <input type="text" id="number-input" value={targetNumber} onChange={handleNumberChange} />
              <Button
                autoFocus
                tabIndex={1}
                variant="contained"
                size="medium"
                onClick={handleClick}
                style={{ backgroundColor: '#000', color: '#fff', marginLeft: 20 }}
              >
                <Phone />
                <Template code="Dial" />
              </Button>
            </label>
          </PhoneDialog>
        )}
        <span>Conference</span>
      </Column>
    </form>
  );
};

export default withTaskContext(ConferencePanel);
