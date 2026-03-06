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
import { InputOption } from 'hrm-form-definitions';

import { Box, Row } from '../../../../styles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import { StyledFormFieldset, StyledFormLegend, StyledFormRadioInput } from './styles';

type RadioInputUIProps = {
  inputId: string;
  updateCallback: () => void;
  options: InputOption[];
  currentValue: any;
  refFunctionForOption: (index: number) => (ref: any) => void;
  label?: string;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
};

const RadioInputUI: React.FC<RadioInputUIProps> = ({
  inputId,
  updateCallback,
  options,
  currentValue,
  refFunctionForOption,
  label,
  required,
  disabled,
  isErrorState,
  errorId,
  errorTextComponent,
}) => {
  return (
    <StyledFormFieldset
      error={isErrorState}
      aria-invalid={isErrorState}
      aria-describedby={errorId}
      disabled={disabled}
      data-testid={`RadioInput-${inputId}`}
    >
      {label && (
        <Row>
          <Box marginBottom="8px">
            <StyledFormLegend>
              <Template code={`${label}`} className=".fullstory-unmask" />
              {required && <RequiredAsterisk />}
            </StyledFormLegend>
          </Box>
        </Row>
      )}
      {options.map(({ value, label: optionLabel }, index) => (
        <Box key={`${inputId}-${value}`} marginBottom="15px">
          <FormLabel htmlFor={`${inputId}-${value}`}>
            <Row>
              <StyledFormRadioInput
                id={`${inputId}-${value}`}
                data-testid={`${inputId}-${value}`}
                name={inputId}
                type="radio"
                value={value}
                onChange={updateCallback}
                ref={refFunctionForOption(index)}
                checked={currentValue === value}
              />
              <Template code={optionLabel} className=".fullstory-unmask" />
            </Row>
          </FormLabel>
        </Box>
      ))}
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </StyledFormFieldset>
  );
};

type Props = FormInputBaseProps & {
  options: InputOption[];
  defaultOption?: InputOption;
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
  const { errors, register, setValue, watch } = useFormContext();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    if (isMounted && defaultOption) setValue(inputId, defaultOption.value);
    else setIsMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, setValue]);

  const error = get(errors, inputId);
  const errorId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);
  const currentValue = watch(inputId) ?? initialValue;

  const refFunctionForOption = React.useCallback(
    (index: number) => (ref: any) => {
      if (index === 0 && htmlElRef) {
        htmlElRef.current = ref;
      }
      register(registerOptions)(ref);
    },
    [htmlElRef, register, registerOptions],
  );

  const disabled = !isEnabled;

  return (
    <RadioInputUI
      inputId={inputId}
      updateCallback={updateCallback}
      options={options}
      currentValue={currentValue}
      refFunctionForOption={refFunctionForOption}
      label={label}
      required={Boolean(registerOptions.required)}
      disabled={disabled}
      isErrorState={Boolean(error)}
      errorId={errorId}
      errorTextComponent={errorTextComponent}
    />
  );
};

export default RadioInput;
