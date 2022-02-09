import type { FormItemDefinition } from 'hrm-form-definitions';

import { getInitialValue } from '../common/forms/formGenerators';

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

// eslint-disable-next-line prefer-named-capture-group
const urlRegex = /(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w-]*)*\/?\??([^#\n\r]*)?#?([^\n\r]*)/g;

export const definitionObject: CSAMFormDefinitionObject = {
  webAddress: {
    name: 'webAddress',
    label: 'Web address',
    type: 'input',
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
    type: 'textarea',
    maxLength: { value: 500, message: '500 characters max.' },
  },
  anonymous: {
    name: 'anonymous',
    label: '',
    type: 'radio-input',
    options: [
      { value: 'anonymous', label: 'File anonymously' },
      { value: 'non-anonymous', label: 'Provide contact details' },
    ],
    required: { value: true, message: 'RequiredFieldError' },
  },
  firstName: {
    name: 'firstName',
    label: "Reporter's First Name",
    type: 'input',
    maxLength: { value: 50, message: '50 characters max.' },
  },
  lastName: {
    name: 'lastName',
    label: "Reporter's Last Name",
    type: 'input',
    maxLength: { value: 50, message: '50 characters max.' },
  },
  email: {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: { value: 100, message: '100 characters max.' },
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
