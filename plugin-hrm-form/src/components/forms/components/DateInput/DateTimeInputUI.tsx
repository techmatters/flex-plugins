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
import { FormError, FormLabel, RequiredAsterisk } from '../styles';

type DateTimeInputUIProps = {
  inputId: string;
  type: 'date' | 'time';
  updateCallback: () => void;
  refFunction: (ref: any) => void;
  defaultValue: React.HTMLAttributes<HTMLElement>['defaultValue'];
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
  InputComponent: React.ComponentType<any>;
};

/*
 * Shared UI component for DateInput and TimeInput.
 * Both are variants of the same structure, differing only in the styled input component and type attribute.
 */
const DateTimeInputUI: React.FC<DateTimeInputUIProps> = ({
  inputId,
  type,
  updateCallback,
  refFunction,
  defaultValue,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorId,
  errorTextComponent,
  InputComponent,
}) => {
  return (
    <FormLabel htmlFor={inputId} data-testid={`${type === 'date' ? 'DateInput' : 'TimeInput'}-${inputId}`}>
      <Row>
        <Box marginBottom="8px">
          {labelTextComponent}
          {required && <RequiredAsterisk />}
        </Box>
      </Row>
      <InputComponent
        type={type}
        id={inputId}
        data-testid={inputId}
        name={inputId}
        error={isErrorState}
        aria-invalid={isErrorState}
        aria-required={required}
        aria-errormessage={isErrorState ? errorId : undefined}
        aria-describedby={errorId}
        onBlur={updateCallback}
        ref={refFunction}
        defaultValue={defaultValue}
        disabled={disabled}
      />
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

export default DateTimeInputUI;
