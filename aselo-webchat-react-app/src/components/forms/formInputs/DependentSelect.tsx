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
import { Box, Label, Select as SelectInput } from '@twilio-paste/core';
import { FormInputType, PreEngagementFormItem } from 'hrm-form-definitions';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { PreEngagementDataItem } from '../../../store/definitions';

type OwnProps = {
  definition: PreEngagementFormItem & { type: FormInputType.DependentSelect };
  getItem: (inptuName: string) => PreEngagementDataItem;
  setItemValue: (payload: { name: string; value: string | boolean }) => void;
  handleChange: (inputName: string) => React.ChangeEventHandler<HTMLSelectElement>;
  defaultValue?: string;
};

type Props = OwnProps;

const DependentSelect: React.FC<Props> = ({ getItem, setItemValue, definition, handleChange }) => {
  const { dependsOn, name, label, required, options } = definition;
  const thisItem = getItem(name);
  // const currentValue = thisItem.value;
  const dependsOnValue = getItem(dependsOn).value as string;
  const prevValueRef = useRef<string | boolean>();

  const shouldClear = prevValueRef.current && dependsOnValue !== prevValueRef.current;

  useEffect(() => {
    prevValueRef.current = dependsOnValue;
  }, [dependsOnValue]);

  // Resets <select> when dependsOn value changes
  useEffect(() => {
    if (shouldClear) {
      const value = options[dependsOnValue]?.length ? options[dependsOnValue][0]?.value : '';
      setItemValue({ name, value });
    }
  }, [name, dependsOnValue, shouldClear, setItemValue, options]);

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
          <LocalizedTemplate code={label} /> {Boolean(required) && '*'}
        </span>
        <SelectInput
          id={name}
          hasError={Boolean(thisItem.error)}
          onBlur={handleChange(name)}
          disabled={!dependsOnValue}
        >
          {buildOptions()}
        </SelectInput>
      </Label>
      {thisItem.error && (
        <span style={{ color: 'rgb(203, 50, 50)' }}>
          <LocalizedTemplate code={thisItem.error} />
        </span>
      )}
    </Box>
  );
};

export default DependentSelect;
