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
  /*
   * TODO this all could be factored out into a custom hook to make easier sharing this chunk of code
   * As described in https://react-hook-form.com/api/useform/watch#:~:text=This%20API%20will%20trigger%20re%2Drender%20at%20the%20root%20of%20your%20app%20or%20form%2C%20consider%20using%20a%20callback%20or%20the%20useWatch%20api%20if%20you%20are%20experiencing%20performance%20issues.
   * the root object triggers a re-render because of formState and watch properties.
   * We can instead only receibe the other properties from the useFormContext, and for those components that need watch use https://react-hook-form.com/api/usewatch instead
   */
  const { errors, register } = useFormContext();
  const error = get(errors, inputId);
  const labelTextComponent = <Template code={`${label}`} className=".fullstory-unmask" />;
  const errorComponentId = `${inputId}-error`;
  const errorTextComponent = error ? <Template id={errorComponentId} code={error.message} /> : null;
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

  // This component can be wrapped in a React.useMemo to save re-painting every label+input unless it's really necessary (e.g. there's an error and the UI should be different)
  return (
    /*
     * In this component is less evident cause it's simple, but ideally the "inner component" will be a stateless UI with all what's needed provided as props,
     * and the outer one will be a wrapper that "binds" the inner one with our custom logic (rhf, Twilio Template and all of the dependecies should be injected into it).
     * This way, moving the actual UI components to a component library will be feacible (if we ever want to)
     */
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
