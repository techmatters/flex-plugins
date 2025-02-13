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

import React, {useEffect, useState} from 'react';
import { Template } from '@twilio/flex-ui';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { CustomContactComponentDefinition } from 'hrm-form-definitions';

import { Box, Row, FormTextArea as StyledTextArea } from '../../../../styles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import { generateCustomContactFormItem } from '../customContactComponent';

type FormTextAreaUIProps = {
  inputId: string;
  updateCallback: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  refFunction: (ref: any) => void;
  value: React.HTMLAttributes<HTMLElement>['defaultValue'];
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
  rows?: number;
  width?: number | string;
  placeholder?: string;
  additionalActionComponents?: JSX.Element[];
};

const FormTextAreaUI: React.FC<FormTextAreaUIProps> = ({
  inputId,
  updateCallback,
  onChange,
  refFunction,
  value,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorTextComponent,
  rows,
  width,
  placeholder,
  additionalActionComponents = [],
}) => {
  return (
    <FormLabel htmlFor={inputId}>
      <Row>
        <Box marginBottom="8px">
          {labelTextComponent}
          {required && <RequiredAsterisk />}
        </Box>
        <Box>{additionalActionComponents}</Box>
      </Row>
      <StyledTextArea
        id={inputId}
        data-testid={inputId}
        name={inputId}
        error={isErrorState}
        aria-invalid={isErrorState}
        aria-describedby={`${inputId}-error`}
        onBlur={updateCallback}
        onChange={onChange}
        placeholder={placeholder}
        ref={refFunction}
        rows={rows ? rows : 10}
        width={width}
        disabled={disabled}
        value={value}
      />
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

type Props = FormInputBaseProps & {
  rows?: number;
  width?: number | string;
  placeholder?: string;
  additionalActionDefinitions?: CustomContactComponentDefinition[];
  additionalActionContext?: {
    taskSid?: string;
    contactId?: string;
  };
};

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
  additionalActionDefinitions = [],
  additionalActionContext = {},
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
  const additionalActionComponents = additionalActionDefinitions.map(actionDefinition =>
    generateCustomContactFormItem(actionDefinition, `${inputId}.${actionDefinition.name}`, additionalActionContext),
  );
  const defaultValue = typeof initialValue === 'boolean' ? initialValue.toString() : initialValue;
  const disabled = !isEnabled;
  const [currentValue, setCurrentValue] = useState(defaultValue ?? '');
  useEffect(() => {
    setCurrentValue(defaultValue);
  }, [defaultValue]);
  return (
    <FormTextAreaUI
      inputId={inputId}
      updateCallback={updateCallback}
      onChange={e => setCurrentValue(e.target.value)}
      errorId={errorId}
      refFunction={refFunction}
      value={currentValue}
      labelTextComponent={labelTextComponent}
      errorTextComponent={errorTextComponent}
      disabled={disabled}
      required={Boolean(registerOptions.required)}
      isErrorState={Boolean(error)}
      rows={rows}
      width={width}
      placeholder={placeholder}
      additionalActionComponents={additionalActionComponents}
    />
  );
};

export default FormTextArea;
