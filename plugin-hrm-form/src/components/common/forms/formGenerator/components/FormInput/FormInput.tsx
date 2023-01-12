import { Template } from '@twilio/flex-ui';
import React from 'react';
import { get } from 'lodash';
import { useFormContext } from 'react-hook-form';

import { Box, Row } from '../../../../../../styles/HrmStyles';
import { FormError, FormLabel, RequiredAsterisk } from '../styles';
import { FormInputProps } from '../types';
import { FormInputInner } from './styles';

type Props = FormInputProps;

const FormInput: React.FC<Props> = ({
  inputId,
  label,
  initialValue,
  registerOptions,
  updateCallback,
  htmlElRef,
  isItemEnabled,
}) => {
  // TODO this all could be factored out into a custom hook to make easier sharing this chunk of code
  const methods = useFormContext();
  const { errors } = methods;
  const error = get(errors, inputId);
  const labelTextComponent = React.useMemo(() => <Template code={`${label}`} className=".fullstory-unmask" />, [label]);
  const errorComponentId = `${inputId}-error`;
  const errorTextComponent = React.useMemo(
    () => (error ? <Template id={errorComponentId} code={error.message} /> : null),
    [error, errorComponentId],
  );
  const { register } = methods;
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
  const disabled = !isItemEnabled();

  /*
   * In this component is less evident cause it's simple, but ideally the "inner component" will be a stateless UI with all what's needed provided as props,
   * and the outer one will be a wrapper that "binds" the inner one with our custom logic (rhf, Twilio Template and all of the dependecies should be injected into it).
   * This way, moving the actual UI components to a component library will be feacible (if we ever want to)
   */
  return (
    <FormLabel htmlFor={inputId}>
      <Row>
        <Box marginBottom="8px">
          {labelTextComponent}
          {registerOptions.required && <RequiredAsterisk />}
        </Box>
      </Row>
      <FormInputInner
        id={inputId}
        data-testid={inputId}
        name={inputId}
        error={Boolean(error)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorComponentId}
        onBlur={updateCallback}
        ref={refFunction}
        defaultValue={defaultValue}
        disabled={disabled}
      />
      {error && <FormError>{errorTextComponent}</FormError>}
    </FormLabel>
  );
};

export default FormInput;
