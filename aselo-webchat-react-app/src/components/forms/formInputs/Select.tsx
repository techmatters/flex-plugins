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
import { Box, Label, Select as SelectInput } from '@twilio-paste/core';
import { FormInputType, PreEngagementFormItem } from 'hrm-form-definitions';
import { useSelector } from 'react-redux';

import { localizeKey } from '../../../localization/localizeKey';
import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { PreEngagementDataItem } from '../../../store/definitions';
import { selectCurrentTranslations } from '../../../store/config.reducer';

type OwnProps = {
  definition: PreEngagementFormItem & { type: FormInputType.Select };
  getItem: (inptuName: string) => PreEngagementDataItem;
  handleChange: (payload: { name: string; value: string | boolean }) => void;
  defaultValue?: PreEngagementDataItem['value'];
  showError?: boolean;
};

type Props = OwnProps;

const Select: React.FC<Props> = ({ definition, getItem, defaultValue, handleChange, showError = true }) => {
  const currentTranslations = useSelector(selectCurrentTranslations);
  const configuredLocalizeKey = localizeKey(currentTranslations);
  const { name, label, required, options } = definition;
  const { error } = getItem(name);
  const buildOptions = () =>
    options.map(option => (
      <option key={option.value} value={option.value}>
        {configuredLocalizeKey(option.label)}
      </option>
    ));

  return (
    <Box style={{ marginBottom: '20px' }}>
      <Label htmlFor={name}>
        <span style={{ display: 'block', marginBottom: '10px' }}>
          <LocalizedTemplate code={label} /> {Boolean(required) && '*'}
        </span>
        <SelectInput
          id={name}
          hasError={Boolean(error && showError)}
          onChange={e => handleChange({ name, value: e.target.value })}
          defaultValue={typeof defaultValue === 'string' ? defaultValue : ''}
        >
          {buildOptions()}
        </SelectInput>
      </Label>
      {error && showError && (
        <span style={{ color: 'rgb(203, 50, 50)' }}>
          <LocalizedTemplate code={error} />
        </span>
      )}
    </Box>
  );
};

export default Select;
