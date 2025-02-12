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

import { Box, Row, FormTextArea as StyledTextArea } from '../../../../styles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';

type FormTextAreaUIProps = {
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
  rows?: number;
  width?: number | string;
  placeholder?: string;
};

/*
 * In this component is less evident cause it's simple, but ideally the "inner component" will be a stateless UI with all what's needed provided as props,
 * and the outer one will be a wrapper that "binds" the inner one with our custom logic (rhf, Twilio Template and all of the dependecies should be injected into it).
 * This way, moving the actual UI components to a component library will be feacible (if we ever want to)
 */
const FormTextAreaUI: React.FC<FormTextAreaUIProps> = ({
  inputId,
  updateCallback,
  refFunction,
  defaultValue,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorTextComponent,
  rows,
  width,
  placeholder,
}) => {
  return (
    <FormLabel htmlFor={inputId}>
      <Row>
        <Box marginBottom="8px">
          {labelTextComponent}
          {required && <RequiredAsterisk />}
        </Box>
      </Row>
      <StyledTextArea
        id={inputId}
        data-testid={inputId}
        name={inputId}
        error={isErrorState}
        aria-invalid={isErrorState}
        aria-describedby={`${inputId}-error`}
        onBlur={updateCallback}
        placeholder={placeholder}
        ref={refFunction}
        rows={rows ? rows : 10}
        width={width}
        defaultValue={defaultValue}
        disabled={disabled}
      />
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

type Props = FormInputBaseProps & { rows?: number; width?: number | string; placeholder?: string };

const FormTextArea: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
  rows,
  width,
  placeholder,
}) => {
  // TODO factor out into a custom hook to make easier sharing this chunk of code
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

      register(registerOptions)(ref);
    },
    [htmlElRef, register, registerOptions],
  );
  // ====== //

  const defaultValue = typeof initialValue === 'boolean' ? initialValue.toString() : initialValue;
  const disabled = !isEnabled;

  return (
    <FormTextAreaUI
      inputId={inputId}
      updateCallback={updateCallback}
      errorId={errorId}
      refFunction={refFunction}
      defaultValue={defaultValue}
      labelTextComponent={labelTextComponent}
      errorTextComponent={errorTextComponent}
      disabled={disabled}
      required={Boolean(registerOptions.required)}
      isErrorState={Boolean(error)}
      rows={rows}
      width={width}
      placeholder={placeholder}
    />
  );
};

export default FormTextArea;
