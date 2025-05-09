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

import React, { useEffect, useRef } from 'react';
import { Template } from '@twilio/flex-ui';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { CustomContactComponentDefinition } from '@tech-matters/hrm-form-definitions';

import { Box, Row, FormTextArea as StyledTextArea } from '../../../../styles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import { generateCustomContactFormItem } from '../customContactComponent';

type FormTextAreaUIProps = {
  inputId: string;
  updateCallback: () => void;
  refFunction: (ref: any) => void;
  initialValue: React.HTMLAttributes<HTMLElement>['defaultValue'];
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
  refFunction,
  initialValue,
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
      <Row style={{ justifyContent: 'space-between', marginBottom: '8px', width }}>
        <Box>
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
        placeholder={placeholder}
        ref={refFunction}
        rows={rows ? rows : 10}
        style={{ width }}
        disabled={disabled}
        defaultValue={initialValue}
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
  const { errors, register, trigger } = useFormContext();
  const error = get(errors, inputId);
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const refFunction = React.useCallback(
    ref => {
      if (htmlElRef && ref) {
        htmlElRef.current = ref;
      }
      internalRef.current = ref;
      register(registerOptions)(ref);
    },
    [htmlElRef, register, registerOptions],
  );
  // ====== //
  const additionalActionComponents = additionalActionDefinitions.map(actionDefinition =>
    generateCustomContactFormItem(actionDefinition, `${inputId}.${actionDefinition.name}`, additionalActionContext),
  );
  const disabled = !isEnabled;
  const initialStringValue = (initialValue ?? '').toString();
  useEffect(() => {
    if (internalRef.current.value !== initialStringValue) {
      // Sync the textarea content the value changes in redux independently of user input
      // Making the textarea controlled results in weird cursor and deletion behaviour (probably due to race conditions between redux and UI updates)
      // This approach might involve a bit of dirty direct DOM manipulation, but it seems to work.
      if (internalRef.current) {
        internalRef.current.value = initialStringValue;
      }
      // retrigger validation if the value changes in redux independently of user input
      trigger(inputId);
    }
  }, [initialStringValue, inputId, trigger]);
  return (
    <FormTextAreaUI
      inputId={inputId}
      updateCallback={updateCallback}
      errorId={errorId}
      refFunction={refFunction}
      initialValue={initialStringValue}
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
