import type { FormItemDefinition } from '../common/forms/types';

export const keys = {
  webAddress: 'webAddress',
  description: 'description',
  anonymous: 'anonymous',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
} as const;

type CSAMFormDefinitionObject = {
  [k in keyof typeof keys]: FormItemDefinition;
};

export const definitionObject: CSAMFormDefinitionObject = {
  webAddress: {
    name: 'webAddress',
    label: 'Web address',
    type: 'input',
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: 1000,
  },
  description: {
    name: 'description',
    label: 'Description (500 characters)',
    type: 'textarea',
    maxLength: 500,
  },
  anonymous: {
    name: 'anonymous',
    label: 'File anonymously',
    type: 'checkbox',
    initialChecked: true,
  },
  firstName: {
    name: 'firstName',
    label: "Reporter's First Name",
    type: 'input',
    maxLength: 50,
  },
  lastName: {
    name: 'lastName',
    label: "Reporter's Last Name",
    type: 'input',
    maxLength: 50,
  },
  email: {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: 100,
  },
};
