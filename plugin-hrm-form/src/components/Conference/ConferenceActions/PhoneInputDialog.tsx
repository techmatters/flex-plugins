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
import { Template, Button } from '@twilio/flex-ui';
import { CallEnd as CallEndIcon } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

import { Row, Bold } from '../../../styles/HrmStyles';
import { CloseButton } from '../../callTypeButtons/styles';
import { PhoneDialogWrapper, DialogArrow } from './styles';

type PhoneDialogProps = {
  targetNumber: string;
  setTargetNumber: (targetNumber: string) => void;
  handleClick: () => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  isLoading: boolean;
};

const PhoneInputDialog: React.FC<PhoneDialogProps> = ({
  targetNumber,
  setTargetNumber,
  handleClick,
  setIsDialogOpen,
  isLoading,
}) => {
  const handleNumberChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    setTargetNumber(e.target.value);
  };
  return (
    <PhoneDialogWrapper>
      <DialogArrow />
      <Row>
        <Bold>
          <Template code="Conference-AddConferenceCallParticipant" />
        </Bold>
        <CloseButton onClick={() => setIsDialogOpen(false)} aria-label="CloseButton" style={{ marginLeft: 'auto' }} />
      </Row>
      <Template code="Conference-EnterPhoneNumber" />
      <Row>
        <input
          type="text"
          id="number-input"
          placeholder="+1 234-567-8910"
          value={targetNumber}
          onChange={handleNumberChange}
          style={{ width: '60%', padding: '5px' }}
          disabled={isLoading}
        />
        <Button
          style={{ backgroundColor: '#192b33', color: '#fff', width: '30%', margin: '0 4px', height: '35px' }}
          autoFocus
          onClick={handleClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={30} style={{ color: '#fff' }} />
          ) : (
            <>
              <CallEndIcon fontSize="medium" /> &nbsp; &nbsp;
              <Template code="Conference-DialButton" />
            </>
          )}
        </Button>
      </Row>
    </PhoneDialogWrapper>
  );
};

export default PhoneInputDialog;
