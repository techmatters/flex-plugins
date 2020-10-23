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

type ItemBase = {
  name: string;
  label: string; // todo: this could be a code from the localized strings object
  parents?: string[];
  required?: boolean;
};

type InputDefinition = {
  type: 'input';
} & ItemBase;

type SelectDefinition = {
  type: 'select';
  options: { value: any; label: string }[];
} & ItemBase;

export type FormItemDefinition = InputDefinition | SelectDefinition;
export type FormDefinition = FormItemDefinition[];
