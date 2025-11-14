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
import { SelectOption } from 'hrm-form-definitions';

import { DependentFormSelectProps } from '../types';
import { generateSelectOptions } from './generateSelectOptions';
import { FormSelectUI } from './FormSelectUI';

const DependentFormSelect: React.FC<DependentFormSelectProps> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
  dependentOptions,
  defaultOption,
  dependsOn,
}) => {
  // TODO factor out into a custom hook to make easier sharing this chunk of code
  const { errors, register, watch, setValue } = useFormContext();
  const error = get(errors, inputId);
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);

  const parents = inputId.split('.').slice(0, -1);
  const dependeePath = [...parents, dependsOn].join('.');
  const dependeeValue = watch(dependeePath);
  const isMounted = React.useRef(false);
  const hasOptions = Boolean(dependeeValue && dependentOptions[dependeeValue]);
  const shouldInitialize = initialValue && !isMounted.current;

  const required = Boolean(registerOptions.required);
  const refFunction = React.useCallback(
    ref => {
      if (htmlElRef && ref) {
        htmlElRef.current = ref;
      }

      register({
        ...registerOptions,
        validate: (data: any) => (hasOptions && required && data === defaultOption.value ? 'RequiredFieldError' : null),
      })(ref);
    },
    [defaultOption.value, hasOptions, htmlElRef, register, registerOptions, required],
  );
  // ====== //

  const defaultValue = (initialValue ?? '').toString();
  // mutable value to avoid reseting the state in the first render. This preserves the "intialValue" provided
  const prevDependeeValue = React.useRef(undefined); // mutable value to store previous dependeeValue

  React.useEffect(() => {
    if (isMounted.current && prevDependeeValue.current && dependeeValue !== prevDependeeValue.current) {
      setValue(inputId, defaultOption, { shouldValidate: true });
    } else {
      isMounted.current = true;
    }

    prevDependeeValue.current = dependeeValue;
  }, [setValue, dependeeValue, inputId, defaultOption]);

  // eslint-disable-next-line no-nested-ternary
  const options: SelectOption[] = hasOptions
    ? [defaultOption, ...dependentOptions[dependeeValue]]
    : shouldInitialize
    ? [defaultOption, { label: defaultValue, value: defaultValue }]
    : [defaultOption];

  const disabled = !isEnabled || (!hasOptions && !shouldInitialize);

  return (
    <FormSelectUI
      inputId={inputId}
      updateCallback={updateCallback}
      refFunction={refFunction}
      defaultValue={defaultValue}
      labelTextComponent={labelTextComponent}
      required={required}
      disabled={disabled}
      isErrorState={Boolean(error)}
      errorId={errorId}
      errorTextComponent={errorTextComponent}
      optionComponents={generateSelectOptions(inputId, options)}
    />
  );
};

export default DependentFormSelect;
