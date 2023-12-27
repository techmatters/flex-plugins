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

import { Box, Row } from '../../../../styles';
import { FormError, FormInputBase, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import useInputContext from '../useInputContext';

type EmailInputUIProps = {
  inputId: string;
  updateCallback: () => void;
  refFunction: (ref: any) => void;
  defaultValue: React.HTMLAttributes<HTMLElement>['defaultValue'];
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
};

const EmailInputUI: React.FC<EmailInputUIProps> = ({
  inputId,
  updateCallback,
  refFunction,
  defaultValue,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorId,
  errorTextComponent,
}) => {
  return (
    <FormLabel htmlFor={inputId} data-testid={`${inputId}-label`}>
      <Row>
        <Box marginBottom="8px">
          {labelTextComponent}
          {required && <RequiredAsterisk />}
        </Box>
      </Row>
      <FormInputBase
        id={inputId}
        name={inputId}
        error={isErrorState}
        aria-invalid={isErrorState}
        aria-required={required}
        aria-errormessage={isErrorState ? errorId : undefined}
        onBlur={updateCallback}
        ref={refFunction}
        defaultValue={defaultValue}
        disabled={disabled}
        data-testid={`${inputId}-input`}
        type="email"
      />
      {isErrorState && <FormError data-testid={`${inputId}-error`}>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

type Props = FormInputBaseProps;

const EmailInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
}) => {
  const { refFunction, labelTextComponent, error, errorId, errorTextComponent } = useInputContext({
    htmlElRef,
    inputId,
    label,
    registerOptions: {
      ...registerOptions,
      pattern: { value: /\S+@\S+\.\S+/, message: 'Entered value does not match email format' },
    },
  });

  const defaultValue = typeof initialValue === 'boolean' ? initialValue.toString() : initialValue;
  const disabled = !isEnabled;

  return (
    <EmailInputUI
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

export default EmailInput;
