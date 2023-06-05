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
import React, { useEffect, useState } from 'react';
import { Manager, Button, Template } from '@twilio/flex-ui';
import { Phone } from '@material-ui/icons';
import PhoneInput from 'react-phone-number-input';

import { Column } from '../../../styles/HrmStyles';
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
      <strong>
        <Template code="AddConferenceCallParticipant" />
      </strong>
      {/* <button type="button" onClick={() => setIsDialogOpen(false)}>
        <CloseButton aria-label="CloseButton" />
      </button> */}
      <CloseButton onClick={() => setIsDialogOpen(false)} aria-label="CloseButton" />
      <br />
      <Template code="EnterPhoneNumber" /> <br />
      <Column>
        <PhoneInput placeholder="+1 234-555-5553" value={targetNumber} onChange={setTargetNumber} />
        <Button
          autoFocus
          tabIndex={1}
          variant="contained"
          size="medium"
          onClick={handleClick}
          style={{
            backgroundColor: '#000',
            color: '#fff',
            marginLeft: 20,
            width: `-webkit-fill-available`,
            margin: `10px`,
          }}
        >
          <Phone />
          <Template code="Dial" />
        </Button>
      </Column>
    </PhoneDialogWrapper>
  );
};

export default PhoneInputDialog;
