import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import each from 'jest-each';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';

import * as FormComponents from './components';
import { createInput } from './inputGenerator';
import { createFormMethods, wrapperFormProvider } from './test-utils.test';

afterEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
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

      render(createdInput, {
        // Override register to be a plain function as it will fail, don't seem to like jest.fn
        wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }),
      });

      /*
       * This kinda inspects the internal implementation of the components
       * but that's exactly the intention of this test
       */
      expect(screen.getByTestId(`${expectedFormComponent}-${formItemDefinition.name}`)).toBeInTheDocument();
    },
  );
});
