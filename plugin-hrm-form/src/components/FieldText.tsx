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

/* eslint-disable react/prop-types */
import React, { CSSProperties } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';

import { ErrorText, TextField, FormInput, FormLabel } from '../styles';
import RequiredAsterisk from './RequiredAsterisk';
import { FormFieldType } from './common/forms/types';

type OwnProps = {
  id: string;
  label?: string | JSX.Element;
  placeholder?: string;
  field: FormFieldType;
  rows?: number;
  // Someday we should make this consistent with DefaultEventHandlers in /components/common/forms/types.ts
  handleBlur: React.FocusEventHandler<HTMLDivElement | HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleFocus: React.FocusEventHandler<HTMLDivElement | HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  style?: CSSProperties;
  onKeyPress: KeyboardEventHandler<HTMLInputElement>;
};

const FieldText: React.FC<OwnProps> = ({
  id,
  label,
  placeholder,
  field,
  rows,
  handleBlur,
  handleChange,
  handleFocus,
  ...rest
}) => (
  <TextField {...rest}>
    <FormLabel htmlFor={id}>
      {label}
      <RequiredAsterisk field={field} />
    </FormLabel>
    <FormInput
      id={id}
      placeholder={placeholder}
      error={field.error !== null}
      value={field.value}
      /*
       * multiline={Boolean(rows)}
       * rows={rows}
       */
      onBlur={handleBlur}
      onChange={handleChange}
      onFocus={handleFocus}
    />
    {field.error && <ErrorText>{field.error}</ErrorText>}
  </TextField>
);

FieldText.displayName = 'FieldText';

FieldText.defaultProps = {
  label: '',
  placeholder: '',
  rows: undefined,
};

export default FieldText;
