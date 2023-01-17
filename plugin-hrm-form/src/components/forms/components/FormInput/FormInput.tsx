import React from 'react';
import { Template } from '@twilio/flex-ui';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';

import { Box, Row } from '../../../../styles/HrmStyles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputBaseProps } from '../types';
import { StyledFormInput } from './styles';

type FormInputUIProps = {
  inputId: string;
  updateCallback: () => void;
  refFunction: (ref: any) => void;
  defaultValue: React.HTMLAttributes<HTMLElement>['defaultValue'];
  labelTextComponent: JSX.Element;
  required: boolean;
  disabled: boolean;
  isErrorState: boolean;
  errorComponentId: string;
  errorTextComponent: JSX.Element;
};

/*
 * In this component is less evident cause it's simple, but ideally the "inner component" will be a stateless UI with all what's needed provided as props,
 * and the outer one will be a wrapper that "binds" the inner one with our custom logic (rhf, Twilio Template and all of the dependecies should be injected into it).
 * This way, moving the actual UI components to a component library will be feacible (if we ever want to)
 */
const FormInputUI = React.memo<FormInputUIProps>(
  ({
    inputId,
    updateCallback,
    refFunction,
    defaultValue,
    labelTextComponent,
    required,
    disabled,
    isErrorState,
    errorComponentId,
    errorTextComponent,
  }) => {
    return (
      <FormLabel htmlFor={inputId}>
        <Row>
          <Box marginBottom="8px">
            {labelTextComponent}
            {required && <RequiredAsterisk />}
          </Box>
        </Row>
        <StyledFormInput
          id={inputId}
          data-testid={`FormInput-${inputId}`}
          name={inputId}
          error={isErrorState}
          aria-invalid={isErrorState}
          aria-describedby={errorComponentId}
          onBlur={updateCallback}
          ref={refFunction}
          defaultValue={defaultValue}
          disabled={disabled}
        />
        {isErrorState && <FormError>{errorTextComponent}</FormError>}
      </FormLabel>
    );
  },
);

type Props = FormInputBaseProps;

const FormInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isEnabled,
}) => {
  // TODO factor out into a custom hook to make easier sharing this chunk of code
  const { errors, register } = useFormContext();
  const error = get(errors, inputId);
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorComponentId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(
    () => (error ? <Template id={errorComponentId} code={error.message} /> : null),
    [error, errorComponentId],
  );
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

  const defaultValue = typeof initialValue === 'boolean' ? initialValue.toString() : initialValue;
  const disabled = !isEnabled;

  return (
    <FormInputUI
      inputId={inputId}
      labelTextComponent={labelTextComponent}
      required={Boolean(registerOptions.required)}
      isErrorState={Boolean(error)}
      errorComponentId={errorComponentId}
      updateCallback={updateCallback}
      refFunction={refFunction}
      defaultValue={defaultValue}
      disabled={disabled}
      errorTextComponent={errorTextComponent}
    />
  );
};

export default FormInput;
