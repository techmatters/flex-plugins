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

/**
 * This is a helper wrapper component.
 * It handles things that are common to all form-components:
 * - React Hook Form Binding
 * - Validation and Error Messaging
 * - Component Label
 */

import React, { useRef } from 'react';
import { useFormContext, Controller, UseControllerProps, FieldError } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { Box, Label } from '@twilio-paste/core';

import LocalizedTemplate from '../../../localization/LocalizedTemplate';
import { selectCurrentTranslations } from '../../../store/config.reducer';
import { localizeKey } from '../../../localization/localizeKey';

export type HandleChangeFunction = () => void;

type OwnProps = {
  label: string;
  defaultValue?: string;
  isCheckbox?: boolean;
  children: JSX.Element;
  handleChange: HandleChangeFunction;
};

type Props = OwnProps & UseControllerProps;

// TODO: Displaying error can be more elegant and robust
const getErrorMessage = (error: any | FieldError | undefined, currentLocale: (key: string) => string) => {
  if (error === undefined) {
    return '';
  }

  if (error.type === 'required') {
    return error.message || currentLocale('FieldValidationRequiredField');
  }

  if (error.type === 'pattern') {
    /**
     * TODO: ideally there should be a a more generic error string like
     * "FieldValidationInvalidPattern". Right now, Email Validation is the only
     * validation we're using besides Required Fields, so we're fine with
     * falling back to "FieldValidationInvalidEmail".
     */
    return error.message || currentLocale('FieldValidationInvalidEmail');
  }

  return error.message || '';
};

const FormComponent: React.FC<Props> = ({ name, label, rules, defaultValue, isCheckbox, children, handleChange }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const isRequired = Boolean(rules?.required);

  const translations = useSelector(selectCurrentTranslations);
  const currentLocale = localizeKey(translations);

  return (
    <Box style={{ marginBottom: '20px' }}>
      {/* <Label htmlFor={name} css={{ ...(isCheckbox ? { display: 'flex', alignItems: 'center' } : {}) }}> */}
      <Label htmlFor={name}>
        {!isCheckbox && (
          <span style={{ display: 'block', marginBottom: '10px' }}>
            <LocalizedTemplate code={label} /> {isRequired && '*'}
          </span>
        )}
        <Controller
          name={name}
          rules={rules}
          defaultValue={defaultValue || ''}
          control={control}
          render={({ field }) => {
            const inputOverrides = {
              ...field,
              id: name,
              error: Boolean(errors[name]),
              onBlur: handleChange,
              ref: () => field.ref({ focus: () => inputRef.current?.focus() }),
              innerRef: inputRef,
            };
            return React.cloneElement(children, { ...inputOverrides });
          }}
        />
        {isCheckbox && (
          <span>
            <LocalizedTemplate code={label} /> {isRequired && '*'}
          </span>
        )}
      </Label>
      {errors[name] && (
        <span style={{ color: 'rgb(203, 50, 50)' }}>{getErrorMessage(errors[name], currentLocale)}</span>
      )}
    </Box>
  );
};

export default FormComponent;
