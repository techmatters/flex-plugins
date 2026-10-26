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

import { ADDABLE_FIELD_TYPES, FIELD_TYPE_INFO, FieldType } from '../formEditing';

type Props = {
  onAdd: (type: FieldType) => void;
  onCancel: () => void;
};

export const AddFieldMenu = ({ onAdd, onCancel }: Props) => (
  <div className="add-field-menu" role="dialog" aria-label="Choose the kind of field to add">
    <div className="add-field-menu-header">
      <strong>What kind of answer?</strong>
      <button type="button" className="link-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
    <ul>
      {ADDABLE_FIELD_TYPES.map((type) => (
        <li key={type}>
          <button type="button" className="field-type-option" onClick={() => onAdd(type)}>
            <span className="field-type-name">{FIELD_TYPE_INFO[type].label}</span>
            <span className="muted">{FIELD_TYPE_INFO[type].description}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);
