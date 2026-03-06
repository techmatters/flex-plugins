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
import { FormError, RequiredAsterisk } from '../styles';
import { StyledFormCheckbox } from '../FormCheckbox/styles';
import { FormInputBaseProps } from '../types';
import {
  StyledListboxMultiselect,
  StyledListboxOption,
  StyledListboxOptionLabel,
  StyledListboxOptionsContainer,
} from './styles';

/**
 * Helper function used to calculate the element that should be focused for ListboxMultiselect type inputs
 */
const calculateNextFocusable = (currentValue: any[], options: InputOption[]) => {
  if (currentValue && currentValue.length) {
    return options.map(o => o.value).findIndex(v => v === currentValue[0]);
  }
  return 0;
};

/**
 * Helper function used to calculate the tabIndex for each option of ListboxMultiselect type inputs
 */
const calculateOptionsTabIndexes = (currentValue: any[], options: InputOption[]) =>
  options.map((option, index) => (index === calculateNextFocusable(currentValue, options) ? undefined : -1));

type ListboxMultiselectUIProps = {
  inputId: string;
  updateCallback: () => void;
  options: InputOption[];
  optionsTabIndexes: number[];
  optionsRefs: React.MutableRefObject<HTMLElement[]>;
  initialValue: any[];
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
  height?: number;
  width?: number;
  refFunctionForOption: (index: number) => (ref: any) => void;
  onKeyDown: React.KeyboardEventHandler<HTMLUListElement>;
  onFocus: React.FocusEventHandler<HTMLUListElement>;
  onBlur: React.FocusEventHandler<HTMLUListElement>;
};

const ListboxMultiselectUI: React.FC<ListboxMultiselectUIProps> = ({
  inputId,
  updateCallback,
  options,
  optionsTabIndexes,
  initialValue,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorId,
  errorTextComponent,
  height,
  width,
  refFunctionForOption,
  onKeyDown,
  onFocus,
  onBlur,
}) => {
  return (
    <StyledListboxMultiselect
      role="listbox"
      error={isErrorState}
      aria-invalid={isErrorState}
      aria-describedby={errorId}
      aria-multiselectable
      height={height}
      width={width}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      data-testid={`ListboxMultiselect-${inputId}`}
    >
      <Row>
        <Box marginBottom="8px">
          <legend
            style={{ display: 'flex', fontSize: '14px', letterSpacing: '0', minHeight: '18px', color: '#000000' }}
          >
            {labelTextComponent}
            {required && <RequiredAsterisk />}
          </legend>
        </Box>
      </Row>
      <StyledListboxOptionsContainer>
        {options.map(({ value, label }, index) => (
          <Box key={`${inputId}-${value}`} marginBottom="5px">
            <StyledListboxOption role="option">
              <StyledListboxOptionLabel htmlFor={`${inputId}-${value}`}>
                <Box marginRight="5px">
                  <StyledFormCheckbox
                    id={`${inputId}-${value}`}
                    data-testid={`ListboxMultiselect-option-${inputId}-${value}`}
                    name={inputId}
                    type="checkbox"
                    value={value}
                    onChange={updateCallback}
                    tabIndex={optionsTabIndexes[index]}
                    ref={refFunctionForOption(index)}
                    defaultChecked={initialValue.includes(value)}
                    disabled={disabled}
                  />
                </Box>
                <Template code={label} className=".fullstory-unmask" />
              </StyledListboxOptionLabel>
            </StyledListboxOption>
          </Box>
        ))}
      </StyledListboxOptionsContainer>
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </StyledListboxMultiselect>
  );
};

type Props = FormInputBaseProps & {
  options: InputOption[];
  height?: number;
  width?: number;
};

const ListboxMultiselect: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
  options,
  height,
  width,
}) => {
  const { errors, register, getValues } = useFormContext();
  const error = get(errors, inputId);
  const errorId = `${inputId}-error`;
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);

  const optionsRefs = React.useRef<HTMLElement[]>([]);
  const [optionsTabIndexes, setOptionsTabIndexes] = React.useState<number[]>([]);
  const [computeFocus, setComputeFocus] = React.useState(false);
  const [focusedOption, setFocusedOption] = React.useState(-1);

  // Effect to set optionsTabIndexes on the first render
  React.useEffect(() => {
    calculateOptionsTabIndexes(get(getValues(), inputId), options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues]);

  // Effect that computes focus, triggered onFocus
  React.useEffect(() => {
    if (computeFocus) {
      setFocusedOption(calculateNextFocusable(get(getValues(), inputId), options));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeFocus, getValues]);

  // Effect that focuses the corresponding option
  React.useEffect(() => {
    if (optionsRefs.current[focusedOption]) optionsRefs.current[focusedOption].focus();
  }, [focusedOption]);

  const handleOnKeyDown: React.KeyboardEventHandler<HTMLUListElement> = event => {
    if (event.key === 'ArrowDown') setFocusedOption(prev => (prev + 1 < options.length ? prev + 1 : 0));
    if (event.key === 'ArrowUp') setFocusedOption(prev => (prev - 1 >= 0 ? prev - 1 : options.length - 1));
  };

  const handleOnFocus: React.FocusEventHandler<HTMLUListElement> = () => {
    if (!computeFocus) {
      setOptionsTabIndexes(options.map(() => -1));
      setComputeFocus(true);
    }
  };

  const handleOnBlur: React.FocusEventHandler<HTMLUListElement> = event => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOptionsTabIndexes(calculateOptionsTabIndexes(get(getValues(), inputId), options));
      setFocusedOption(-1);
      setComputeFocus(false);
    }
  };

  const refFunctionForOption = React.useCallback(
    (index: number) => (ref: any) => {
      if (index === 0 && htmlElRef) {
        htmlElRef.current = ref;
      }
      optionsRefs.current[index] = ref;
      register(registerOptions)(ref);
    },
    [htmlElRef, register, registerOptions],
  );

  const disabled = !isEnabled;
  const currentInitialValue = Array.isArray(initialValue) ? initialValue : [];

  return (
    <ListboxMultiselectUI
      inputId={inputId}
      updateCallback={updateCallback}
      options={options}
      optionsTabIndexes={optionsTabIndexes}
      optionsRefs={optionsRefs}
      initialValue={currentInitialValue}
      labelTextComponent={labelTextComponent}
      required={Boolean(registerOptions.required)}
      disabled={disabled}
      isErrorState={Boolean(error)}
      errorId={errorId}
      errorTextComponent={errorTextComponent}
      height={height}
      width={width}
      refFunctionForOption={refFunctionForOption}
      onKeyDown={handleOnKeyDown}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    />
  );
};

export default ListboxMultiselect;
