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
import { MixedOrBool } from 'hrm-form-definitions';

import { Box } from '../../../../styles';
import { FormCheckBoxWrapper, FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import { StyledMixedCheckbox } from './styles';

type MixedCheckboxUIProps = {
  inputId: string;
  updateCallback: () => void;
  htmlElRef: FormInputBaseProps['htmlElRef'];
  checked: MixedOrBool;
  onCheckedChange: (next: MixedOrBool) => void;
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorId: string;
  errorTextComponent: JSX.Element;
};

const MixedCheckboxUI: React.FC<MixedCheckboxUIProps> = ({
  inputId,
  updateCallback,
  htmlElRef,
  checked,
  onCheckedChange,
  labelTextComponent,
  required,
  disabled,
  isErrorState,
  errorId,
  errorTextComponent,
}) => {
  return (
    <FormLabel htmlFor={inputId} data-testid={`MixedCheckbox-${inputId}`}>
      <FormCheckBoxWrapper error={isErrorState}>
        <Box marginRight="5px">
          <StyledMixedCheckbox
            id={inputId}
            data-testid={inputId}
            type="checkbox"
            className="mixed-checkbox"
            aria-invalid={isErrorState}
            aria-checked={checked}
            aria-required={required}
            aria-errormessage={isErrorState ? errorId : undefined}
            onBlur={updateCallback}
            onChange={() => {
              if (checked === 'mixed') onCheckedChange(true);
              else if (checked === true) onCheckedChange(false);
              else onCheckedChange('mixed');
            }}
            ref={ref => {
              if (htmlElRef) {
                htmlElRef.current = ref;
              }
            }}
            disabled={disabled}
          />
        </Box>
        {labelTextComponent}
        {required && <RequiredAsterisk />}
      </FormCheckBoxWrapper>
      {isErrorState && <FormError>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

type Props = FormInputBaseProps;

const MixedCheckbox: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
}) => {
  const { errors, register, setValue } = useFormContext();

  React.useEffect(() => {
    register(inputId, registerOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [register]);

  const initialChecked: MixedOrBool =
    initialValue === undefined || typeof initialValue !== 'boolean' ? 'mixed' : initialValue;
  const [checked, setChecked] = React.useState<MixedOrBool>(initialChecked);

  React.useEffect(() => {
    setValue(inputId, checked);
  }, [checked, setValue, inputId]);

  const error = get(errors, inputId);
  const errorId = `${inputId}-error`;
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorTextComponent = React.useMemo(() => (error ? <Template id={errorId} code={error.message} /> : null), [
    error,
    errorId,
  ]);

  const disabled = !isEnabled;

  return (
    <MixedCheckboxUI
      inputId={inputId}
      updateCallback={updateCallback}
      htmlElRef={htmlElRef}
      checked={checked}
      onCheckedChange={setChecked}
      labelTextComponent={labelTextComponent}
      required={Boolean(registerOptions.required)}
      disabled={disabled}
      isErrorState={Boolean(error)}
      errorId={errorId}
      errorTextComponent={errorTextComponent}
    />
  );
};

export default MixedCheckbox;
