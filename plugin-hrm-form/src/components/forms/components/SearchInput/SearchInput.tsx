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
import SearchIcon from '@material-ui/icons/Search';

import { Box, Row } from '../../../../styles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import { SearchIconContainer, StyledSearchInput } from './styles';

type SearchInputUIProps = {
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

const SearchInputUI: React.FC<SearchInputUIProps> = ({
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
    <>
      <FormLabel htmlFor={inputId} data-testid={`SearchInput-${inputId}`}>
        <Row>
          <Box marginBottom="8px">
            {/* visually hidden but still accessible to screen readers */}
            <span
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
              }}
            >
              {labelTextComponent}
            </span>
            {required && <RequiredAsterisk />}
          </Box>
        </Row>
      </FormLabel>
      <div>
        <SearchIconContainer>
          <SearchIcon style={{ fontSize: '20px' }} />
        </SearchIconContainer>
        <StyledSearchInput
          id={inputId}
          data-testid={inputId}
          name={inputId}
          error={isErrorState}
          aria-describedby={`${inputId}-label`}
          role="search"
          aria-label="Search"
          onBlur={updateCallback}
          ref={refFunction}
          defaultValue={defaultValue}
          disabled={disabled}
        />
      </div>
      {labelTextComponent && (
        <span id={`${inputId}-label`} style={{ display: 'none' }}>
          {labelTextComponent}
        </span>
      )}
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </>
  );
};

type Props = FormInputBaseProps;

const SearchInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
}) => {
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

  const defaultValue = typeof initialValue === 'boolean' ? initialValue.toString() : initialValue;
  const disabled = !isEnabled;

  return (
    <SearchInputUI
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

export default SearchInput;
