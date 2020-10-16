export type FormFieldType = { value: string; error?: string; validation?: string[]; touched?: boolean };

export function isFormFieldType(object: any): object is FormFieldType {
  return (
    typeof object.value === 'string' &&
    (!object.touched || typeof object.touched === 'boolean') &&
    (!object.error || typeof object.error === 'string') &&
    (!object.validation || object.validation instanceof Array)
  );
}

export type Counselor = {
  label?: string;
  value?: string;
};

export type FormFieldSelectType = {
  value: boolean | string | Counselor;
  error?: string;
  validation?: string[];
  touched?: boolean;
};

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
