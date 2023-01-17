import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import each from 'jest-each';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';
import { FormProvider, UseFormMethods } from 'react-hook-form';

import * as FormComponents from '../../../components/forms/components';
import { createInput } from '../../../components/forms/inputGenerator';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

const createFormMethods = (): UseFormMethods => ({
  clearErrors: jest.fn(),
  control: {} as any,
  errors: {},
  formState: {} as any,
  getValues: jest.fn(),
  handleSubmit: jest.fn(),
  register: () => jest.fn(),
  reset: jest.fn(),
  setError: jest.fn(),
  setValue: jest.fn(),
  trigger: jest.fn(),
  unregister: jest.fn(),
  watch: jest.fn(),
});

describe('createInput', () => {
  const testCases: {
    formItemDefinition: FormItemDefinition;
    initialValue: string;
    expectedFormComponent: keyof typeof FormComponents;
  }[] = [
    {
      formItemDefinition: {
        type: FormInputType.Input,
        name: 'input',
        label: 'Input',
      },
      initialValue: '',
      expectedFormComponent: 'FormInput',
    },
  ];

  each(testCases).test(
    'case $formItemDefinition.type returns $expectedFormComponent',
    async ({ formItemDefinition, initialValue, expectedFormComponent }) => {
      const updateCallback = jest.fn();

      const createdInput = createInput({
        formItemDefinition,
        initialValue,
        parentsPath: '',
        updateCallback,
        htmlElRef: null,
        isItemEnabled: () => true,
      });

      const methods = createFormMethods();

      render(<FormProvider {...methods}>{createdInput}</FormProvider>);

      /*
       * This kinda inspects the internal implementation of the components
       * but that's exactly the intention of this test
       */
      expect(screen.getByTestId(`${expectedFormComponent}-${formItemDefinition.name}`)).toBeInTheDocument();
    },
  );
});
