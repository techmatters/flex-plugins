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
import { InputOption } from 'hrm-form-definitions';
import { Template } from '@twilio/flex-ui';

import { Box, Row } from '../../../../styles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import useInputContext from '../useInputContext';
import { FormFieldset, FormRadioInput } from './styles';

type RadioInputUIProps = {
  inputId: string;
  updateCallback: () => void;
  refFunction: (index?: number) => (ref: any) => void;
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
  options: InputOption[];
  currentValue: InputOption['value'];
};

const RadioInputUI: React.FC<RadioInputUIProps> = ({
  inputId,
  updateCallback,
  refFunction,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorId,
  errorTextComponent,
  options,
  currentValue,
}) => {
  return (
    <FormFieldset
      error={isErrorState}
      aria-invalid={isErrorState}
      aria-required={required}
      aria-errormessage={isErrorState ? errorId : undefined}
      disabled={disabled}
    >
      {labelTextComponent && (
        <Box marginBottom="8px">
          <Row>
            {labelTextComponent}
            {required && <RequiredAsterisk />}
          </Row>
        </Box>
      )}
      {options.map(({ value, label }, index) => (
        <Box key={`${inputId}-${value}`} marginBottom="15px">
          <FormLabel htmlFor={`${inputId}-${value}`} data-testid={`${inputId}-${value}-label`}>
            <Row>
              <FormRadioInput
                id={`${inputId}-${value}`}
                data-testid={`${inputId}-${value}`}
                name={inputId}
                type="radio"
                value={value}
                onChange={updateCallback}
                ref={refFunction(index)}
                checked={currentValue === value}
              />
              <Template code={label} className=".fullstory-unmask" />
            </Row>
          </FormLabel>
        </Box>
      ))}
      {isErrorState && (
        <FormError>
          {isErrorState && <FormError data-testid={`${inputId}-error`}>{errorTextComponent}</FormError>}
        </FormError>
      )}
    </FormFieldset>
  );
};

type Props = FormInputBaseProps & {
  options: InputOption[];
  defaultOption: InputOption['value'];
};

const RadioInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
  options,
  defaultOption,
}) => {
  const [isMounted, setIsMounted] = React.useState(false); // value to avoid setting the default in the first render.

  const { refFunction, labelTextComponent, error, errorId, errorTextComponent, watch, setValue } = useInputContext({
    htmlElRef,
    inputId,
    label,
    registerOptions: {
      ...registerOptions,
      pattern: { value: /\S+@\S+\.\S+/, message: 'Entered value does not match email format' },
    },
  });

  React.useEffect(() => {
    if (isMounted && defaultOption) setValue(inputId, defaultOption);
    else setIsMounted(true);
  }, [defaultOption, inputId, isMounted, setValue]);

  const currentValue = watch(inputId) ?? initialValue;
  const disabled = !isEnabled;

  return (
    <RadioInputUI
      inputId={inputId}
      updateCallback={updateCallback}
      refFunction={refFunction}
      labelTextComponent={labelTextComponent}
      required={Boolean(registerOptions.required)}
      disabled={disabled}
      isErrorState={Boolean(error)}
      errorId={errorId}
      errorTextComponent={errorTextComponent}
      options={options}
      currentValue={currentValue}
    />
  );
};

export default RadioInput;
