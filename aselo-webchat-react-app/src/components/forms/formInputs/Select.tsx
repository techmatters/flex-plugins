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

/* eslint-disable react/require-default-props */
import React from 'react';
import { UseControllerOptions } from 'react-hook-form';
import { Box, Label, Select as SelectInput } from '@twilio-paste/core';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { useFormController } from './useFormController';

type Option = {
  value: any;
  label: string;
};

type OwnProps = {
  label: string;
  options: Option[];
  defaultValue?: string;
  handleChange: () => void;
};

type Props = OwnProps & UseControllerOptions;

const Select: React.FC<Props> = ({ name, label, rules, options, defaultValue, handleChange }) => {
  const buildOptions = () =>
    options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));

  const { field, isRequired, error, errorMessage } = useFormController({
    name,
    rules,
    defaultValue,
  });

  return (
    <Box style={{ marginBottom: '20px' }}>
      <Label htmlFor={name}>
        <span style={{ display: 'block', marginBottom: '10px' }}>
          <LocalizedTemplate code={label} /> {isRequired && '*'}
        </span>
        <SelectInput {...field} id={name} hasError={Boolean(error)} onBlur={handleChange}>
          {buildOptions()}
        </SelectInput>
      </Label>
      {error && <span style={{ color: 'rgb(203, 50, 50)' }}>{errorMessage}</span>}
    </Box>
  );
};

export default Select;
