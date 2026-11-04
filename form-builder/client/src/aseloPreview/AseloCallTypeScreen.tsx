/**
 * Copyright (C) 2021-2026 Technology Matters
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

/**
 * The first screen counselors see for a contact: "categorize this contact", with buttons
 * that open the form (data call types) and buttons that close the contact without one
 * (CallTypeButtons and SaveContactCallTypeDialog in plugin-hrm-form).
 */
import { useState } from 'react';
import type { CallTypeButtonsEntry } from '@hrm-form-definitions/formDefinition/types';
import { Strings, translate } from './translations';

type Props = {
  buttons: CallTypeButtonsEntry[];
  strings: Strings;
  taskType: 'chat' | 'call';
  onDataCallType: (name: string) => void;
  onNonDataCallType?: (label: string) => void;
};

// Simple stand-ins for the plugin's CallTypeIcon
const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
    />
  </svg>
);

const PeopleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
    />
  </svg>
);

export const AseloCallTypeScreen = ({
  buttons,
  strings,
  taskType,
  onDataCallType,
  onNonDataCallType,
}: Props) => {
  const [confirming, setConfirming] = useState<CallTypeButtonsEntry>();
  const dataButtons = buttons.filter((button) => button.category === 'data');
  const nonDataButtons = buttons.filter((button) => button.category === 'non-data');

  return (
    <div className="aselo-call-types">
      <div className="aselo-call-types-group">
        <p className="aselo-call-types-label">{translate(strings, 'CallTypeButtons-Categorize')}</p>
        {dataButtons.map((button) => (
          <button
            key={button.name}
            type="button"
            className="aselo-data-call-type"
            onClick={() => onDataCallType(button.name)}
          >
            <span className="aselo-call-type-icon">
              {button.name === 'caller' ? <PeopleIcon /> : <PersonIcon />}
            </span>
            {translate(strings, button.label)}
          </button>
        ))}
      </div>
      {nonDataButtons.length > 0 && (
        <div>
          <p className="aselo-call-types-label">{translate(strings, 'CallTypeButtons-Or')}</p>
          {nonDataButtons.map((button, index) => (
            <button
              key={button.name}
              type="button"
              className={`aselo-non-data-call-type ${index % 2 === 0 ? 'left' : ''}`}
              onClick={() => setConfirming(button)}
            >
              {translate(strings, button.label)}
            </button>
          ))}
        </div>
      )}

      {confirming && (
        <div className="aselo-dialog-backdrop" role="presentation">
          <div className="aselo-dialog" role="dialog" aria-label={translate(strings, 'NonDataCallTypeDialog-CloseConfirm')}>
            <p>{translate(strings, 'NonDataCallTypeDialog-CloseConfirm')}</p>
            <p className="aselo-dialog-detail">{translate(strings, confirming.label)}</p>
            <button
              type="button"
              className="aselo-button aselo-button-destructive"
              onClick={() => {
                onNonDataCallType?.(confirming.label);
                setConfirming(undefined);
              }}
            >
              {translate(strings, taskType === 'call' ? 'TaskHeaderEndCall' : 'TaskHeaderEndChat')}
            </button>
            <button
              type="button"
              className="aselo-button aselo-button-secondary"
              onClick={() => setConfirming(undefined)}
            >
              {translate(strings, 'CancelButton')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
