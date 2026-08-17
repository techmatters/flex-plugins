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
import { Template, Manager } from '@twilio/flex-ui';
import { CallEnd as CallEndIcon } from '@material-ui/icons';
import { CircularProgress } from '@material-ui/core';

import { Row, Bold, CloseButton, SecondaryButton } from '../../../styles';
import { PhoneDialogWrapper, DialogArrow } from './styles';

type PhoneDialogProps = {
  targetNumber: string;
  setTargetNumber: (targetNumber: string) => void;
  handleManualDialClick: () => void;
  handleQuickDialClick: (phoneNumber: string) => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  isLoading: boolean;
};

const ENTER_NUMBER_KEY = 'Conference-EnterPhoneNumber';

type QuickDialItem = {
  labelKey: string;
  phoneNumber: string;
};

const TEMPORARY_HARDCODED_QUICKDIAL: QuickDialItem[] = [
  { labelKey: 'Conference-PhoneInputDialog-QuickDialItem/988-English', phoneNumber: '+35314482861' },
  { labelKey: 'Conference-PhoneInputDialog-QuickDialItem/988-Spanish', phoneNumber: '+35317712424 ' },
];

const ALLOW_MANUAL_DIAL: boolean = true;

const PhoneInputDialog: React.FC<PhoneDialogProps> = ({
  targetNumber,
  setTargetNumber,
  handleQuickDialClick,
  handleManualDialClick,
  setIsDialogOpen,
  isLoading,
}) => {
  const dialButton = (handleClick: () => void) => {
    return (
      <SecondaryButton autoFocus onClick={handleClick} disabled={isLoading}>
        {isLoading ? (
          <CircularProgress size={30} style={{ color: '#fff' }} />
        ) : (
          <>
            <CallEndIcon fontSize="medium" /> &nbsp; &nbsp;
            <Template code="Conference-DialButton" />
          </>
        )}
      </SecondaryButton>
    );
  };

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
      {TEMPORARY_HARDCODED_QUICKDIAL.length && (
        <Row>
          <Template code="Conference-PhoneInputDialog-QuickDialTitle" />
        </Row>
      )}
      {TEMPORARY_HARDCODED_QUICKDIAL.map(({ phoneNumber, labelKey }) => (
        <Row key={labelKey}>
          <Template code={labelKey} /> {dialButton(() => handleQuickDialClick(phoneNumber))}
        </Row>
      ))}
      <Row key="or">
        {TEMPORARY_HARDCODED_QUICKDIAL.length && ALLOW_MANUAL_DIAL && (
          <Template code="Conference-PhoneInputDialog-Or" />
        )}
      </Row>
      {ALLOW_MANUAL_DIAL && (
        <>
          <Template code={ENTER_NUMBER_KEY} />
          <Row>
            <input
              type="text"
              id="number-input"
              placeholder="+1 234-567-8910"
              value={targetNumber}
              onChange={handleNumberChange}
              style={{ width: '60%', padding: '5px' }}
              disabled={isLoading}
              aria-label={Manager.getInstance().strings[ENTER_NUMBER_KEY]}
            />
            {dialButton(handleManualDialClick)}
          </Row>
        </>
      )}
    </PhoneDialogWrapper>
  );
};

export default PhoneInputDialog;
