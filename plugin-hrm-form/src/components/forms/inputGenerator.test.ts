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

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import each from 'jest-each';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';

import * as FormComponents from './components';
import { createInput } from './inputGenerator';
import { createFormMethods, wrapperFormProvider } from './test-utils';

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
