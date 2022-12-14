import { type } from '@testing-library/user-event/dist/types/utility';
import { FormItemDefinition, FormInputType } from 'hrm-form-definitions';

import { getInitialValue } from '../common/forms/formGenerators';

export const counselorKeys = {
  webAddress: 'webAddress',
  description: 'description',
  anonymous: 'anonymous',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
} as const;

export const childKeys = {
  childAge: 'childAge',
  ageVerified: 'ageVerified',
} as const;

type CounselorCSAMFormDefinitionObject = {
  [k in keyof typeof counselorKeys]: FormItemDefinition;
};

type ChildCSAMFormDefinitionObject = {
  [k in keyof typeof childKeys]: FormItemDefinition;
};

// eslint-disable-next-line prefer-named-capture-group
const urlRegex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g;

export const definitionObject: CounselorCSAMFormDefinitionObject = {
  webAddress: {
    name: 'webAddress',
    label: 'Web address',
    type: FormInputType.Input,
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: { value: 1000, message: '1000 characters max.' },
    validate: data => {
      if (!data.match(urlRegex)) return 'NotURLFieldError';
      return null;
    },
  },
  description: {
    name: 'description',
    label: 'Description (500 characters)',
    type: FormInputType.Textarea,
    maxLength: { value: 500, message: '500 characters max.' },
  },
  anonymous: {
    name: 'anonymous',
    label: '',
    type: FormInputType.RadioInput,
    options: [
      { value: 'anonymous', label: 'File anonymously' },
      { value: 'non-anonymous', label: 'Provide contact details' },
    ],
    required: { value: true, message: 'RequiredFieldError' },
  },
  firstName: {
    name: 'firstName',
    label: "Reporter's First Name",
    type: FormInputType.Input,
    maxLength: { value: 50, message: '50 characters max.' },
  },
  lastName: {
    name: 'lastName',
    label: "Reporter's Last Name",
    type: FormInputType.Input,
    maxLength: { value: 50, message: '50 characters max.' },
  },
  email: {
    name: 'email',
    label: 'Email Address',
    type: FormInputType.Email,
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: { value: 100, message: '100 characters max.' },
  },
};

// eslint-disable-next-line import/no-unused-modules
export const childDefinitionObject: ChildCSAMFormDefinitionObject = {
  childAge: {
    name: 'childAge',
    label: '',
    type: FormInputType.RadioInput,
    options: [
      { value: '<13', label: 'Under 13 years old' },
      { value: '13-15', label: '13 to 15 years old' },
      { value: '16-17', label: '16 to 17 years old' },
    ],
  },
  ageVerified: {
    name: 'ageVerified',
    label: 'Yes, age of child has been verified',
    type: FormInputType.Checkbox,
  },
};

export const initialValues = {
  webAddress: getInitialValue(definitionObject.webAddress),
  description: getInitialValue(definitionObject.description),
  anonymous: getInitialValue(definitionObject.anonymous),
  firstName: getInitialValue(definitionObject.firstName),
  lastName: getInitialValue(definitionObject.lastName),
  email: getInitialValue(definitionObject.email),
} as const;

export const childInitialValues = {
  childAge: getInitialValue(childDefinitionObject.childAge),
  ageVerified: getInitialValue(childDefinitionObject.ageVerified),
} as const;
