/* eslint-disable react/display-name */
import React from 'react';
import { useFormContext, ValidationRules, FieldError } from 'react-hook-form';
import { get, pick } from 'lodash';
import { Template } from '@twilio/flex-ui';

import { FormItem, FormRow } from '../../../styles/HrmStyles';
import type { FormItemDefinition, FormDefinition, SelectOption } from './types';

export const ConnectForm: React.FC<{
  children: <P extends ReturnType<typeof useFormContext>>(args: P) => JSX.Element;
}> = ({ children }) => {
  const methods = useFormContext();

  return children({ ...methods });
};

const getRules = (field: FormItemDefinition): ValidationRules =>
  pick(field, ['max', 'maxLength', 'min', 'minLength', 'pattern', 'required', 'validate']);

const renderError = (error: FieldError) =>
  error.type === 'required' ? (
    <span>
      <Template code="RequiredFieldError" />
    </span>
  ) : (
    <span>
      <Template code={error.message} />
    </span>
  );

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
              <FormItem>
                <label htmlFor={path}>{def.label}</label>
                <input name={path} onBlur={updateCallback} ref={register(rules)} />
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
                  onBlur={updateCallback}
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
                <select name={path} onBlur={updateCallback} ref={register(rules)}>
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
    case 'dependent-select':
      return (
        <ConnectForm key={path}>
          {({ errors, register, watch, setValue }) => {
            const dependeePath = [...parents, def.dependsOn].join('.');
            const dependeeValue = watch(dependeePath);

            React.useEffect(() => setValue(path, def.defaultOption.value), [setValue, dependeeValue]);

            const error = get(errors, path);
            const hasOptions = dependeeValue && def.options[dependeeValue];
            const required = Boolean(def.required && hasOptions);

            const options: SelectOption[] = hasOptions
              ? [def.defaultOption, ...def.options[dependeeValue]]
              : [def.defaultOption];

            return (
              <FormItem>
                <label htmlFor={path}>{def.label}</label>
                <select
                  name={path}
                  onBlur={updateCallback}
                  ref={register({ ...rules, required })}
                  disabled={!hasOptions}
                >
                  {options.map(o => (
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
    case 'checkbox':
      return (
        <ConnectForm key={path}>
          {({ errors, register }) => {
            const error = get(errors, path);
            return (
              <FormItem>
                <label htmlFor={path}>{def.label}</label>
                <input name={path} type="checkbox" onChange={updateCallback} ref={register(rules)} />
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
  updateCallback: () => void,
): JSX.Element[] => definition.map(getInputType(parents, updateCallback));

export const makeFormRows = (formItems: JSX.Element[]) => {
  const [x, y, ...rest] = formItems;
  if (!x) return [];

  if (!y)
    return [
      <FormRow key={`formRow-${x.key}`}>
        {x}
        <div />
      </FormRow>,
    ];

  const row = (
    <FormRow key={`formRow-${x.key}-${y.key}`}>
      {x}
      {y}
    </FormRow>
  );
  return [row, ...makeFormRows(rest)];
};
