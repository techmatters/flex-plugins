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
import { Box, Input, Label } from '@twilio-paste/core';
import { FormInputType, PreEngagementFormItem } from 'hrm-form-definitions';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { PreEngagementDataItem } from '../../../store/definitions';

type OwnProps = {
  definition: PreEngagementFormItem & { type: FormInputType.Input | FormInputType.Email };
  pattern?: RegExp;
  getItem: (inptuName: string) => PreEngagementDataItem;
  handleChange: (inputName: string) => React.ChangeEventHandler<HTMLInputElement>;
  defaultValue?: string;
};

type Props = OwnProps;

const InputText: React.FC<Props> = ({ definition, handleChange, getItem, defaultValue }) => {
  const { name, label, placeholder, required } = definition;
  const { error } = getItem(name);

  return (
    <Box style={{ marginBottom: '20px' }}>
      <Label htmlFor={name}>
        <span style={{ display: 'block', marginBottom: '10px' }}>
          <LocalizedTemplate code={label} /> {Boolean(required) && '*'}
        </span>
        <Input
          type="text"
          id={name}
          placeholder={placeholder}
          hasError={Boolean(error)}
          onChange={handleChange(name)}
        />
      </Label>
      {error && (
        <span style={{ color: 'rgb(203, 50, 50)' }}>
          <LocalizedTemplate code={error} />
        </span>
      )}
    </Box>
  );
};

export default InputText;
