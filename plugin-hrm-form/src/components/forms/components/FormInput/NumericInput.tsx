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

import React from 'react';
import { Template } from '@twilio/flex-ui';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';

import { FormInputBaseProps } from '../types';
import { FormInputUI } from './FormInput';

const NUMERIC_PATTERN = { value: /^[0-9]+$/g, message: 'This field only accepts numeric input.' };

type Props = FormInputBaseProps;

const NumericInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
}) => {
  const { errors, register } = useFormContext();
  const error = get(errors, inputId);
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);
  const refFunction = React.useCallback(
    ref => {
      if (htmlElRef && ref) {
        htmlElRef.current = ref;
      }

      register({ ...registerOptions, pattern: NUMERIC_PATTERN })(ref);
    },
    [htmlElRef, register, registerOptions],
  );

  const defaultValue = typeof initialValue === 'boolean' ? initialValue.toString() : initialValue;
  const disabled = !isEnabled;

  return (
    <FormInputUI
      inputId={inputId}
      updateCallback={updateCallback}
      refFunction={refFunction}
      defaultValue={defaultValue}
      labelTextComponent={labelTextComponent}
      required={Boolean(registerOptions.required)}
      disabled={disabled}
      isErrorState={Boolean(error)}
      errorId={errorId}
      errorTextComponent={errorTextComponent}
    />
  );
};

export default NumericInput;
