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
import { Box, Checkbox as CheckboxInput, Label } from '@twilio-paste/core';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { useFormController } from './useFormController';

type OwnProps = {
  label: string;
  handleChange: () => void;
  defaultValue?: boolean;
};

type Props = OwnProps & UseControllerOptions;

const Checkbox: React.FC<Props> = ({ name, label, rules, handleChange, defaultValue }) => {
  const { field, isRequired, error, errorMessage } = useFormController({
    name,
    rules,
    defaultValue: Boolean(defaultValue),
  });

  return (
    <Box style={{ marginBottom: '20px' }}>
      <Label htmlFor={name}>
        <CheckboxInput
          {...field}
          id={name}
          hasError={Boolean(error)}
          onBlur={handleChange}
          onChange={(e: any) => field.onChange(e.target.checked)}
          // ref={inputRef as any}
          type="checkbox"
          checked={field.value}
          css={{ display: 'flex', alignItems: 'center' }}
        >
          <LocalizedTemplate code={label} /> {isRequired && '*'}
        </CheckboxInput>
      </Label>
      {error && <span style={{ color: 'rgb(203, 50, 50)' }}>{errorMessage}</span>}
    </Box>
  );
};

export default Checkbox;
