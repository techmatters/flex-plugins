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

import { styled } from '@twilio/flex-ui';

export const ConferenceButtonWrapper = styled('div')`
  margin-left: 8px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  flex-flow: column;
  align-items: center;
`;

type PhoneDialogWrapperProps = {
  width?: string;
};
export const PhoneDialogWrapper = styled('div')<PhoneDialogWrapperProps>`
  position: absolute;
  background: white;
  box-sizing: border-box;
  left: 20px;
  bottom: 80px;
  min-width: 300px;
  width: 90%;
  padding: 15px 22px;
  border: 1px solid lightgray;
  border-radius: 4px;
  box-shadow: 0px 0px 3px 2px rgb(0 0 0 / 10%);
  z-index: 100;
`;
PhoneDialogWrapper.displayName = 'PhoneDialogWrapper';

export const PhoneDialogContent = styled('div')`
  margin: 12px 0;
`;
PhoneDialogContent.displayName = 'PhoneDialogContent';

export const PhoneDialogFooter = styled('div')`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
`;
PhoneDialogFooter.displayName = 'PhoneDialogFooter';

export const PhoneNumberInput = styled('input')`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f3f4f6;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
PhoneNumberInput.displayName = 'PhoneNumberInput';

export const QuickDialSelect = styled('select')`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  background-color: #f3f4f6;
  cursor: pointer;
  appearance: auto;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
QuickDialSelect.displayName = 'QuickDialSelect';

export const HelpText = styled('p')`
  && {
    margin: 6px 0 0;
    font-size: 13px;
    font-weight: normal;
    color: #606b85;
  }
`;
HelpText.displayName = 'HelpText';

export const ConferenceButton = styled('button')`
  border-style: none;
  border-radius: 50%;
  min-width: auto;
  cursor: pointer;
  background-color: none;
`;
ConferenceButton.displayName = 'ConferenceButton';

export const HangUpButton = styled(ConferenceButton)`
  background-color: #c81c25;
  color: #fff;
`;
HangUpButton.displayName = 'HangUpButton';
