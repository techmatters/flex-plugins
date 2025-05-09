/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import { FormItemDefinition, FormInputType, FormDefinition } from '@tech-matters/hrm-form-definitions';
import { useForm } from 'react-hook-form';

import { addMargin, getInitialValue } from '../common/forms/formGenerators';
import { createInput } from '../forms/inputGenerator';

type CounselorCSAMFormDefinitionObject = {
  webAddress: FormItemDefinition;
  description: FormItemDefinition;
  anonymous: FormItemDefinition;
  firstName: FormItemDefinition;
  lastName: FormItemDefinition;
  email: FormItemDefinition;
};

type ChildCSAMFormDefinitionObject = {
  childAge: FormItemDefinition;
  ageVerified: FormItemDefinition;
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
    required: { value: true, message: 'RequiredFieldError' },
  },
  ageVerified: {
    name: 'ageVerified',
    label: 'Yes, age of child has been verified',
    type: FormInputType.Checkbox,
    required: { value: true, message: 'RequiredFieldError' },
    validate: Boolean,
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

export const externalReportDefinition: FormDefinition = [
  {
    name: 'reportType',
    label: '',
    type: FormInputType.RadioInput,
    required: true,
    options: [
      { value: 'child', label: 'Create link for child' },
      { value: 'counsellor', label: 'Report as counselor' },
    ],
  },
];

export const generateCSAMFormElement = <T>(
  initialValues: T,
  formValues: T,
  update: (values: Record<string, any>) => void,
  methods: ReturnType<typeof useForm>,
) => (formItem: FormItemDefinition): JSX.Element => {
  const onUpdateInput = () => {
    update(methods.getValues());
  };
  const generatedInput = createInput({
    formItemDefinition: formItem,
    parentsPath: '',
    updateCallback: onUpdateInput,
    initialValue: formValues[formItem.name] === undefined ? initialValues[formItem.name] : formValues[formItem.name],
  });

  return addMargin(5)(generatedInput);
};
