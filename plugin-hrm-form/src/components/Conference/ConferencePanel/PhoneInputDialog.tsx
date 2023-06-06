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
import { Button, Template } from '@twilio/flex-ui';
import { CallEnd as CallEndIcon } from '@material-ui/icons';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { Row, Bold } from '../../../styles/HrmStyles';
import { CloseButton } from '../../../styles/callTypeButtons';
import { PhoneDialogWrapper, DialogArrow } from './style';

type PhoneDialogProps = {
  targetNumber: string;
  setTargetNumber: (targetNumber: string) => void;
  handleClick: () => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
};

const PhoneInputDialog: React.FC<PhoneDialogProps> = ({
  targetNumber,
  setTargetNumber,
  handleClick,
  setIsDialogOpen,
}) => {
  return (
    <PhoneDialogWrapper>
      <DialogArrow />
      <Row>
        <Bold>
          <Template code="Conference-AddConferenceCallParticipant" />
        </Bold>
        <CloseButton onClick={() => setIsDialogOpen(false)} aria-label="CloseButton" style={{ marginLeft: 'auto' }} />
      </Row>

      <br />
      <Template code="Conference-EnterPhoneNumber" />
      <Row>
        <PhoneInput
          style={{ fontSize: '20px' }}
          placeholder="+1 234-555-5553"
          value={targetNumber}
          onChange={setTargetNumber}
        />
        <Button
          autoFocus
          tabIndex={1}
          // size="medium"
          onClick={handleClick}
          style={{
            backgroundColor: '#2762e1',
            color: '#fff',
            marginLeft: 20,
            width: '30%',
            margin: '0 2px',
          }}
          disabled={!isValidPhoneNumber(targetNumber)}
        >
          <CallEndIcon fontSize="medium" /> &nbsp;
          <Template code="Conference-DialButton" />
        </Button>
      </Row>
    </PhoneDialogWrapper>
  );
};

export default PhoneInputDialog;
