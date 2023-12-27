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

type FormInputUIProps = {
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

/*
 * In this component is less evident cause it's simple, but ideally the "inner component" will be a stateless UI with all what's needed provided as props,
 * and the outer one will be a wrapper that "binds" the inner one with our custom logic (rhf, Twilio Template and all of the dependecies should be injected into it).
 * This way, moving the actual UI components to a component library will be feacible (if we ever want to)
 */
const FormInputUI: React.FC<FormInputUIProps> = ({
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
    <FormLabel htmlFor={inputId} data-testid={`FormInput-${inputId}`}>
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
      />
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

type Props = FormInputBaseProps;

const FormInput: React.FC<Props> = ({
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
    registerOptions,
  });

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

export default FormInput;
