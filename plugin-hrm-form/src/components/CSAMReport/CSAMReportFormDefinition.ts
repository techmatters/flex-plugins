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
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/g;

export const definitionObject: CSAMFormDefinitionObject = {
  webAddress: {
    name: 'webAddress',
    label: 'Web address',
    type: 'input',
    required: { value: true, message: 'RequiredFieldError' },
    maxLength: 1000,
    pattern: {
      value: urlRegex,
      message: 'NotURLFieldError',
    },
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

export const initialValues = {
  webAddress: getInitialValue(definitionObject.webAddress),
  description: getInitialValue(definitionObject.description),
  anonymous: getInitialValue(definitionObject.anonymous),
  firstName: getInitialValue(definitionObject.firstName),
  lastName: getInitialValue(definitionObject.lastName),
  email: getInitialValue(definitionObject.email),
} as const;
