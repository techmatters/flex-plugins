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
import React, { useMemo, useEffect } from 'react';
import { Box, Input, Label } from '@twilio-paste/core';
import { FormInputType, PreEngagementFormItem } from 'hrm-form-definitions';
import debounce from 'lodash.debounce';
import { useSelector } from 'react-redux';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { PreEngagementDataItem } from '../../../store/definitions';
import { selectCurrentTranslations } from '../../../store/config.reducer';
import { localizeKey } from '../../../localization/localizeKey';

type OwnProps = {
  definition: PreEngagementFormItem & { type: FormInputType.Input | FormInputType.Email };
  pattern?: RegExp;
  getItem: (inptuName: string) => PreEngagementDataItem;
  handleChange: (payload: { name: string; value: string | boolean }) => void;
  defaultValue?: PreEngagementDataItem['value'];
  showError?: boolean;
};

type Props = OwnProps;

const InputText: React.FC<Props> = ({ definition, defaultValue, handleChange, getItem, showError = true }) => {
  const currentTranslations = useSelector(selectCurrentTranslations);
  const configuredLocalizeKey = localizeKey(currentTranslations);
  const { name, label, placeholder, required } = definition;
  const { error } = getItem(name);

  const debouncedHandleChange = useMemo(() => debounce(handleChange, 500), [handleChange]);

  useEffect(() => {
    return () => {
      debouncedHandleChange.cancel();
    };
  }, [debouncedHandleChange]);

  return (
    <Box style={{ marginBottom: '20px' }}>
      <Label htmlFor={name}>
        <span style={{ display: 'block', marginBottom: '10px' }}>
          <LocalizedTemplate code={label} /> {Boolean(required) && '*'}
        </span>
        <Input
          type="text"
          id={name}
          placeholder={placeholder === undefined ? undefined : configuredLocalizeKey(placeholder)}
          hasError={Boolean(error && showError)}
          onBlur={e => handleChange({ name, value: e.target.value })}
          onChange={e => debouncedHandleChange({ name, value: e.target.value })}
          defaultValue={typeof defaultValue === 'string' ? defaultValue : ''}
        />
      </Label>
      {error && showError && (
        <span style={{ color: 'rgb(203, 50, 50)' }}>
          <LocalizedTemplate code={error} />
        </span>
      )}
    </Box>
  );
};

export default InputText;
