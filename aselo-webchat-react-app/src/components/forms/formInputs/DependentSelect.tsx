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
import React, { useEffect, useRef } from 'react';
import { useFormContext, UseControllerOptions } from 'react-hook-form';
import { Box, Label, Select as SelectInput } from '@twilio-paste/core';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { useFormController } from './useFormController';

type Options = {
  [key: string]: {
    value: any;
    label: string;
  }[];
};

type OwnProps = {
  label: string;
  dependsOn: string;
  options: Options;
  handleChange: () => void;
};

type Props = OwnProps & UseControllerOptions;

const DependentSelect: React.FC<Props> = ({ name, label, rules, dependsOn, options, handleChange }) => {
  const { field, isRequired, error, errorMessage } = useFormController({
    name,
    rules,
  });
  const {
    watch,
    setValue,
    formState: { dirtyFields },
  } = useFormContext();
  const currentValue = watch(name);
  const dependsOnValue = watch(dependsOn);
  const prevValueRef = useRef();

  const isDirty = currentValue || dirtyFields[name];
  const shouldClear = prevValueRef.current && dependsOnValue !== prevValueRef.current;

  useEffect(() => {
    prevValueRef.current = dependsOnValue;
  }, [dependsOnValue]);

  // Resets <select> when dependsOn value changes
  useEffect(() => {
    if (shouldClear) {
      setValue(name, '', { shouldValidate: isDirty }); // isDirty here prevents displaying errors too soon
      handleChange();
    }
  }, [name, dependsOnValue, shouldClear, isDirty, setValue, handleChange]);

  const buildOptions = () =>
    dependsOnValue && options[dependsOnValue]
      ? options[dependsOnValue].map(option => (
          <option key={option.value} value={option.value}>
            {/* {<LocalizedTemplate code={option.label} />} */}
            {option.label}
          </option>
        ))
      : [];

  return (
    <Box style={{ marginBottom: '20px' }}>
      <Label htmlFor={name}>
        <span style={{ display: 'block', marginBottom: '10px' }}>
          <LocalizedTemplate code={label} /> {isRequired && '*'}
        </span>
        <SelectInput {...field} id={name} hasError={Boolean(error)} onBlur={handleChange} disabled={!dependsOnValue}>
          {buildOptions()}
        </SelectInput>
      </Label>
      {error && <span style={{ color: 'rgb(203, 50, 50)' }}>{errorMessage}</span>}
    </Box>
  );
};

export default DependentSelect;
