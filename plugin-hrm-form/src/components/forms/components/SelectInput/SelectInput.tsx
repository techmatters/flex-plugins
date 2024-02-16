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
import { SelectOption } from 'hrm-form-definitions';

import { Box, Row } from '../../../../styles';
import { FormError, FormLabel, FormSelect, FormSelectWrapper, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import useInputContext from '../useInputContext';
import { generateSelectOptions } from '../select-utils';

type SelectInputUIProps = {
  inputId: string;
  updateCallback: () => void;
  refFunction: (ref: any) => void;
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
  options: SelectOption[];
  initialValue: SelectOption['value'];
};

const SelectInputUI: React.FC<SelectInputUIProps> = ({
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
  initialValue,
}) => {
  return (
    <FormLabel htmlFor={inputId} data-testid={`${inputId}-label`}>
      <Row>
        <Box marginBottom="8px">
          {labelTextComponent}
          {required && <RequiredAsterisk />}
        </Box>
      </Row>
      <FormSelectWrapper>
        <FormSelect
          id={inputId}
          data-testid={`${inputId}-input`}
          name={inputId}
          error={isErrorState}
          aria-invalid={isErrorState}
          aria-errormessage={isErrorState ? errorId : undefined}
          aria-required={required}
          onChange={updateCallback}
          ref={refFunction}
          disabled={disabled}
        >
          {generateSelectOptions(inputId, options, initialValue)}
        </FormSelect>
      </FormSelectWrapper>
      {isErrorState && (
        <FormError>
          {isErrorState && <FormError data-testid={`${inputId}-error`}>{errorTextComponent}</FormError>}
        </FormError>
      )}
    </FormLabel>
  );
};

type Props = FormInputBaseProps & {
  options: SelectOption[];
  // defaultOption: SelectOption['value'];
};

const SelectInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
  options,
  // defaultOption,
}) => {
  const { refFunction, labelTextComponent, error, errorId, errorTextComponent } = useInputContext({
    htmlElRef,
    inputId,
    label,
    registerOptions,
  });

  const disabled = !isEnabled;

  return (
    <SelectInputUI
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
      initialValue={initialValue}
    />
  );
};

export default SelectInput;
