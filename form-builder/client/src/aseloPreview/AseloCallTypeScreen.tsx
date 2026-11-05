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

import { ClearIcon, FaceIcon } from './flexIcons';
import { Strings, translate } from './translations';

type Props = {
  buttons: CallTypeButtonsEntry[];
  strings: Strings;
  taskType: 'chat' | 'call';
  onDataCallType: (name: string) => void;
  onNonDataCallType?: (label: string) => void;
};

// CallTypeIcon: one face for the child, two overlapping for a caller. Other names don't match one
// of Aselo's call types, so it shows them as (empty) silent text
const CallTypeIcon = ({ name }: { name: string }) => {
  if (name === 'child') return <FaceIcon />;
  if (name === 'caller') {
    return (
      <>
        <span className="aselo-call-type-face-overlap">
          <FaceIcon />
        </span>
        <FaceIcon />
      </>
    );
  }
  return <span className="aselo-silent-text" />;
};

export const AseloCallTypeScreen = ({ buttons, strings, taskType, onDataCallType, onNonDataCallType }: Props) => {
  const [confirming, setConfirming] = useState<CallTypeButtonsEntry>();
  const dataButtons = buttons.filter(button => button.category === 'data');
  const nonDataButtons = buttons.filter(button => button.category === 'non-data');

  return (
    <div className="aselo-call-types">
      <div className="aselo-call-types-group">
        <p className="aselo-call-types-label">{translate(strings, 'CallTypeButtons-Categorize')}</p>
        {dataButtons.map((button, index) => (
          <button
            key={button.name}
            type="button"
            className="aselo-data-call-type"
            // As in Aselo, the first one has focus when the screen opens
            // eslint-disable-next-line jsx-a11y/no-autofocus -- Aselo focuses it too
            autoFocus={index === 0}
            onClick={() => onDataCallType(button.name)}
          >
            <span className="aselo-call-type-icon">
              <CallTypeIcon name={button.name} />
            </span>
            {translate(strings, button.label)}
          </button>
        ))}
      </div>
      {/* Aselo shows the heading even when there are no buttons under it */}
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

      {confirming && (
        <div className="aselo-dialog-backdrop" role="presentation">
          <div
            className="aselo-dialog"
            role="dialog"
            aria-label={translate(strings, 'NonDataCallTypeDialog-CloseConfirm')}
          >
            <button
              type="button"
              className="aselo-dialog-close"
              aria-label={translate(strings, 'CloseButton')}
              onClick={() => setConfirming(undefined)}
            >
              <ClearIcon />
            </button>
            <p className="aselo-dialog-text">{translate(strings, 'NonDataCallTypeDialog-CloseConfirm')}</p>
            <div className="aselo-dialog-buttons">
              <button
                type="button"
                className="aselo-dialog-button aselo-dialog-confirm"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- Aselo focuses it too
                autoFocus
                onClick={() => {
                  onNonDataCallType?.(confirming.label);
                  setConfirming(undefined);
                }}
              >
                {translate(strings, taskType === 'call' ? 'TaskHeaderEndCall' : 'TaskHeaderEndChat')}
              </button>
              <button
                type="button"
                className="aselo-dialog-button aselo-dialog-cancel"
                onClick={() => setConfirming(undefined)}
              >
                {translate(strings, 'CancelButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
