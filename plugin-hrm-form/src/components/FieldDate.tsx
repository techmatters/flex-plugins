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
import { format, formatISO } from 'date-fns';

import { ErrorText, TextField, FormDateInput, FormLabel } from '../styles';
import RequiredAsterisk from './RequiredAsterisk';

type Counselor = {
  label: string;
  value: string;
};

type Field = {
  value: string | boolean | Counselor;
  error?: string;
  validation: string[];
  touched: boolean;
};

type MyProps = {
  id: string;
  label?: string;
  placeholder?: string;
  field: Field;
  handleBlur: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleFocus: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
};

const FieldDate: React.FC<MyProps> = ({
  id,
  label = '',
  placeholder = '',
  field,
  handleBlur,
  handleChange,
  handleFocus,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [type, setType] = useState('text');

  const onFocus = event => {
    setIsFocused(true);
    handleFocus(event);
  };

  const onBlur = event => {
    setType('text');
    setIsFocused(false);
    handleBlur(event);
  };

  const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    handleChange({
      ...event,
      target: {
        ...event.target,
        value: convertUiValueToSavedValue(event.target.value),
      },
    });
  };

  const onMouseEnter = () => setType('date');

  const onMouseLeave = () => !isFocused && setType('text');

  const convertUiValueToSavedValue = uiValue => (uiValue ? formatISO(new Date(`${uiValue} 00:00:00`)) : undefined);

  const convertSavedValueToUiValue = savedValue => (savedValue ? format(new Date(savedValue), 'yyyy-MM-dd') : '');

  return (
    <TextField {...rest}>
      {label && (
        <FormLabel htmlFor={id}>
          {label}
          <RequiredAsterisk field={field} />
        </FormLabel>
      )}
      <FormDateInput
        id={id}
        placeholder={placeholder}
        error={field.error !== null}
        value={convertSavedValueToUiValue(field.value)}
        type={type}
        pattern="yyyy-mm-dd"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ width: '110px', marginRight: '10px' }}
      />
      {field.error && <ErrorText>{field.error}</ErrorText>}
    </TextField>
  );
};

FieldDate.displayName = 'FieldDate';

export default FieldDate;
