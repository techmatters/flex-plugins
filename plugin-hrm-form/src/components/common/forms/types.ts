import type { ValidationRules } from 'react-hook-form';

export type FormFieldType = { value: string; error?: string; validation?: string[]; touched?: boolean };

export function isFormFieldType(object: any): object is FormFieldType {
  return (
    typeof object.value === 'string' &&
    (!object.touched || typeof object.touched === 'boolean') &&
    (!object.error || typeof object.error === 'string') &&
    (!object.validation || object.validation instanceof Array)
  );
}

export type FormInformation = {
  [key: string]: FormFieldType | FormInformation;
};

// Given a type T that defines a form (where each leaf is of type FormFieldType), infers the structure, with each leaf as the type of FormFieldType['value']
export type FormValues<T> = {
  [P in keyof T]: T[P] extends FormFieldType
    ? FormFieldType['value']
    : T[P] extends FormInformation
    ? FormValues<T[P]>
    : never;
};

export type DefaultEventHandlers = (
  parents: string[],
  name: string,
) => {
  handleBlur: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleFocus: React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
  handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>;
};

/**
 * Types that may be used for customizable forms
 */

type InputDefinition = {
  name: string;
  label: string; // todo: this could be a code from the localized strings object
  type: 'input';
  // required?: boolean;
} & ValidationRules;

type NumericInputDefinition = {
  name: string;
  label: string; // todo: this could be a code from the localized strings object
  type: 'numeric input';
} & ValidationRules;

type SelectDefinition = {
  name: string;
  label: string; // todo: this could be a code from the localized strings object
  type: 'select';
  options: { value: any; label: string }[];
} & ValidationRules;

export type FormItemDefinition = InputDefinition | NumericInputDefinition | SelectDefinition;
export type FormDefinition = FormItemDefinition[];
