/* eslint-disable react/no-multi-comp */
/* eslint-disable import/no-unused-modules */
/* eslint-disable react/display-name */
import React from 'react';
import { useFormContext, ValidationRules } from 'react-hook-form';
import { get, pick } from 'lodash';
import { Template } from '@twilio/flex-ui';

import {
  Box,
  ColumnarBlock,
  TwoColumnLayout,
  FormLabel,
  FormError,
  Row,
  FormInput,
  FormDateInput,
  FormTimeInput,
  FormCheckBoxWrapper,
  FormCheckbox,
  FormMixedCheckbox,
  FormSelect,
  FormOption,
  FormSelectWrapper,
  FormTextArea,
} from '../../../styles/HrmStyles';
import type { FormItemDefinition, FormDefinition, SelectOption, MixedOrBool } from './types';

export const ConnectForm: React.FC<{
  children: <P extends ReturnType<typeof useFormContext>>(args: P) => JSX.Element;
}> = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

const RequiredAsterisk = () => (
  <span aria-hidden style={{ color: 'red' }}>
    *
  </span>
);

const getRules = (field: FormItemDefinition): ValidationRules =>
  pick(field, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

/**
 * Creates a Form with each input connected to RHF's wrapping Context, based on the definition.
 * @param {string[]} parents Array of parents. Allows you to easily create nested form fields. https://react-hook-form.com/api#register.
 * @param {() => void} updateCallback Callback called to update form state. When is the callback called is specified in the input type.
 * @param {FormItemDefinition} def Definition for a single input.
 */
const getInputType = (parents: string[], updateCallback: () => void) => (def: FormItemDefinition) => {
  const rules = getRules(def);
  const path = [...parents, def.name].join('.');

  switch (def.type) {
    case 'input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={register(rules)}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'numeric-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormInput
                  id={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={register({
                    ...rules,
                    pattern: { value: /^[0-9]+$/g, message: 'This field only accepts numeric input.' },
                  })}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'select':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormSelectWrapper>
                  <FormSelect
                    id={path}
                    name={path}
                    error={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    innerRef={register(rules)}
                  >
                    {def.options.map(o => (
                      <FormOption key={`${path}-${o.value}`} value={o.value}>
                        {o.label}
                      </FormOption>
                    ))}
                  </FormSelect>
                </FormSelectWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'dependent-select':
      return (
        <ConnectForm key={path}>
          {({ errors, register, watch, setValue }) => {
            const dependeePath = [...parents, def.dependsOn].join('.');
            const dependeeValue = watch(dependeePath);

            React.useEffect(() => setValue(path, def.defaultOption.value), [setValue, dependeeValue]);

            const error = get(errors, path);
            const hasOptions = Boolean(dependeeValue && def.options[dependeeValue]);

            const validate = (data: any) =>
              hasOptions && def.required && data === def.defaultOption.value ? 'RequiredFieldError' : null;

            const options: SelectOption[] = hasOptions
              ? [def.defaultOption, ...def.options[dependeeValue]]
              : [def.defaultOption];

            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormSelectWrapper>
                  <FormSelect
                    id={path}
                    name={path}
                    error={Boolean(error)}
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    innerRef={register({ validate })}
                    disabled={!hasOptions}
                  >
                    {options.map(o => (
                      <FormOption key={`${path}-${o.value}`} value={o.value}>
                        {o.label}
                      </FormOption>
                    ))}
                  </FormSelect>
                </FormSelectWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <FormCheckBoxWrapper error={Boolean(error)}>
                  <FormCheckbox
                    id={path}
                    name={path}
                    type="checkbox"
                    aria-invalid={Boolean(error)}
                    aria-describedby={`${path}-error`}
                    onChange={updateCallback}
                    innerRef={register(rules)}
                  />
                  <Template code={`${def.label}`} />
                  {rules.required && <RequiredAsterisk />}
                </FormCheckBoxWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'mixed-checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register, setValue }) => {
            React.useEffect(() => {
              register(path, rules);
            }, [register]);

            const initialChecked = def.initialChecked === undefined ? 'mixed' : def.initialChecked;
            const [checked, setChecked] = React.useState<MixedOrBool>(initialChecked);

            React.useEffect(() => {
              setValue(path, checked);
            }, [checked, setValue]);

            const error = get(errors, path);

            return (
              <FormLabel htmlFor={path}>
                <FormCheckBoxWrapper error={Boolean(error)}>
                  <FormMixedCheckbox
                    id={path}
                    type="checkbox"
                    className="mixed-checkbox"
                    aria-invalid={Boolean(error)}
                    aria-checked={checked}
                    aria-describedby={`${path}-error`}
                    onBlur={updateCallback}
                    onChange={() => {
                      if (checked === 'mixed') setChecked(true);
                      if (checked === true) setChecked(false);
                      if (checked === false) setChecked('mixed');
                    }}
                  />
                  <Template code={`${def.label}`} />
                  {rules.required && <RequiredAsterisk />}
                </FormCheckBoxWrapper>
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'textarea':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormTextArea
                  id={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={register(rules)}
                  rows={10}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'time-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormTimeInput
                  type="time"
                  id={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={register(rules)}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    case 'date-input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormLabel htmlFor={path}>
                <Row>
                  <Box marginBottom="8px">
                    <Template code={`${def.label}`} />
                    {rules.required && <RequiredAsterisk />}
                  </Box>
                </Row>
                <FormDateInput
                  type="date"
                  id={path}
                  name={path}
                  error={Boolean(error)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={`${path}-error`}
                  onBlur={updateCallback}
                  innerRef={register(rules)}
                />
                {error && (
                  <FormError>
                    <Template id={`${path}-error`} code={error.message} />
                  </FormError>
                )}
              </FormLabel>
            );
          }}
        </ConnectForm>
      );
    default:
      return null;
  }
};

/**
 * Creates a Form with each input connected to RHF's wrapping Context, based on the definition.
 * @param {FormDefinition} definition Form definition (schema).
 * @param {string[]} parents Array of parents. Allows you to easily create nested form fields. https://react-hook-form.com/api#register.
 * @param {() => void} updateCallback Callback called to update form state. When is the callback called is specified in the input type (getInputType).
 */
export const createFormFromDefinition = (definition: FormDefinition) => (parents: string[]) => (
  updateCallback: () => void,
): JSX.Element[] => definition.map(getInputType(parents, updateCallback));

/**
 * Utility functions to create initial state from definition
 * @param {FormItemDefinition} def Definition for a single input of a Form
 */
export const getInitialValue = (def: FormItemDefinition) => {
  switch (def.type) {
    case 'input':
    case 'numeric-input':
    case 'textarea':
    case 'date-input':
    case 'time-input':
      return '';
    case 'select':
      return def.options[0].value;
    case 'dependent-select':
      return def.defaultOption.value;
    case 'checkbox':
      return false;
    case 'mixed-checkbox':
      return def.initialChecked === undefined ? 'mixed' : def.initialChecked;
    default:
      return null;
  }
};

export const createFormItem = <T extends {}>(obj: T, def: FormItemDefinition) => ({
  ...obj,
  [def.name]: getInitialValue(def),
});

export const disperseInputs = (margin: number) => (formItems: JSX.Element[]) =>
  formItems.map(i => (
    <Box key={`${i.key}-wrapping-box`} marginTop={`${margin.toString()}px`} marginBottom={`${margin.toString()}px`}>
      {i}
    </Box>
  ));

export const splitInHalf = (formItems: JSX.Element[]) => {
  const m = Math.ceil(formItems.length / 2);

  const [l, r] = [formItems.slice(0, m), formItems.slice(m)];

  return [l, r];
};

export const buildTwoColumnFormLayout = (formItems: JSX.Element[]) => {
  const items = disperseInputs(5)(formItems);

  const [l, r] = splitInHalf(items);

  return (
    <TwoColumnLayout>
      <ColumnarBlock>{l}</ColumnarBlock>
      <ColumnarBlock>{r}</ColumnarBlock>
    </TwoColumnLayout>
  );
};
