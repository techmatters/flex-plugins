import React from 'react';
import { useFormContext, ValidationRules, FieldError } from 'react-hook-form';
import { get } from 'lodash';
import { Template } from '@twilio/flex-ui';

import { FormItem, FormRow } from '../../../styles/HrmStyles';
import type { FormItemDefinition, FormDefinition } from './types';

export const ConnectForm: React.FC<{ children: <P extends ReturnType<typeof useFormContext>>(args: P) => JSX.Element }> = ({
  children,
}) => {
  const methods = useFormContext();

  return children({ ...methods });
};

const getRules = (field: FormItemDefinition): ValidationRules => ({
  max: field.max,
  maxLength: field.maxLength,
  min: field.min,
  minLength: field.minLength,
  pattern: field.pattern,
  required: field.required,
  validate: field.validate,
});

// eslint-disable-next-line react/display-name
const renderError = (error: FieldError) =>
  error.type === 'required' ? (
    <span>
      <Template code="RequiredFieldError" />
    </span>
  ) : (
    <span>{error.message}</span>
  );

// eslint-disable-next-line react/display-name
const getInputType = (def: FormItemDefinition) => (parents: string[]) => (onBlur: () => void) => {
  const rules = getRules(def);
  const path = [...parents, def.name].join('.');

  switch (def.type) {
    case 'input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormItem>
                <label htmlFor={path}>{def.label}</label>
                <input name={path} onBlur={onBlur} ref={register(rules)} />
                {error && renderError(error)}
              </FormItem>
            );
          }}
        </ConnectForm>
      );
    case 'numeric input':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormItem>
                <label htmlFor={path}>{def.label}</label>
                <input
                  name={path}
                  onBlur={onBlur}
                  ref={register({
                    ...rules,
                    pattern: { value: /^[0-9]+$/g, message: 'This field only accepts numeric input.' },
                  })}
                />
                {error && renderError(error)}
              </FormItem>
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
              <FormItem>
                <label htmlFor={path}>{def.label}</label>
                <select name={path} onBlur={onBlur} ref={register(rules)}>
                  {def.options.map(o => (
                    <option key={`${path}-${o.value}`} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {error && renderError(error)}
              </FormItem>
            );
          }}
        </ConnectForm>
      );
    default:
      return null;
  }
};

export const createFormFromDefinition = (definition: FormDefinition) => (parents: string[]) => (
  onBlur: () => void,
): JSX.Element[] => {
  console.log('>>>> createFormFromDefinition called');

  if (!definition.length) return [];

  if (definition.length === 1)
    return [
      <FormRow key={`${definition[0].name}-form-row`}>
        {getInputType(definition[0])(parents)(onBlur)}
        <div />
      </FormRow>,
    ];

  const [x, y, ...rest] = definition;
  const row = (
    <FormRow key={`${x.name}-${y.name}-form-row`}>
      {getInputType(x)(parents)(onBlur)}
      {getInputType(y)(parents)(onBlur)}
    </FormRow>
  );
  return [row, ...createFormFromDefinition(rest)(parents)(onBlur)];
};
