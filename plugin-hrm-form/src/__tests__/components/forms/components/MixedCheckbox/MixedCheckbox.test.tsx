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

import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import MixedCheckbox from '../../../../../components/forms/components/MixedCheckbox/MixedCheckbox';
import { getInputType } from '../../../../../components/common/forms/formGenerators';
import { createFormMethods, wrapperFormProvider } from '../../../../../components/forms/test-utils';

// Mocked to avoid loadDefinition.js requiring @babel/runtime (infrastructure gap)
jest.mock('hrm-form-definitions', () => ({
  FormInputType: {
    Input: 'input',
    SearchInput: 'search-input',
    NumericInput: 'numeric-input',
    Email: 'email',
    RadioInput: 'radio-input',
    ListboxMultiselect: 'listbox-multiselect',
    Select: 'select',
    DependentSelect: 'dependent-select',
    Checkbox: 'checkbox',
    MixedCheckbox: 'mixed-checkbox',
    Textarea: 'textarea',
    DateInput: 'date-input',
    TimeInput: 'time-input',
    FileUpload: 'file-upload',
    Button: 'button',
    CopyTo: 'copy-to',
    CustomContactComponent: 'custom-contact-component',
  },
}));

const inputId = 'inputID';
const label = 'input label';
const defaultProps = {
  inputId,
  label,
  initialValue: undefined,
  isEnabled: true,
  updateCallback: jest.fn(),
  registerOptions: {},
  htmlElRef: null,
};

describe('MixedCheckbox', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<MixedCheckbox {...defaultProps} />)).toThrow();
  });

  test('on render, is in mixed state by default', () => {
    const methods = createFormMethods();

    render(<MixedCheckbox {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    const formItem = screen.getByTestId(`MixedCheckbox-${inputId}`);
    expect(formItem).toBeInTheDocument();

    const checkbox = screen.getByTestId(inputId);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  test('clicking cycles state: mixed → true → false → mixed', () => {
    const methods = createFormMethods();

    render(<MixedCheckbox {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const checkbox = screen.getByTestId(inputId);

    // Initial state: mixed
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

    // Click: mixed → true
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    // Click: true → false
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Click: false → mixed
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  test('updateCallback is invoked on blur', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<MixedCheckbox {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const checkbox = screen.getByTestId(inputId);
    fireEvent.focus(checkbox);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(checkbox);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      const { container } = render(<MixedCheckbox {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, checkbox is disabled', () => {
      const methods = createFormMethods();

      render(<MixedCheckbox {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(screen.getByTestId(inputId)).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<MixedCheckbox {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});

describe('MixedCheckbox via getInputType (parity)', () => {
  const def = {
    type: 'mixed-checkbox' as any,
    name: inputId,
    label,
  };

  test('on render, is in mixed state by default', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)(undefined);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const checkbox = screen.getByTestId(inputId);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  test('clicking cycles state: mixed → true → false → mixed', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)(undefined);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const checkbox = screen.getByTestId(inputId);

    // Initial: mixed
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');

    // Click: mixed → true
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    // Click: true → false
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Click: false → mixed
    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  test('updateCallback is invoked on blur', () => {
    const updateCallback = jest.fn();
    const methods = createFormMethods();

    const input = getInputType([], updateCallback)(def)(undefined);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const checkbox = screen.getByTestId(inputId);
    fireEvent.focus(checkbox);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(checkbox);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();
      const requiredDef = { ...def, required: true };

      const input = getInputType([], jest.fn())(requiredDef)(undefined);

      const { container } = render(input, {
        wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }),
      });

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, checkbox is disabled', () => {
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)(undefined, null, false);

      render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

      expect(screen.getByTestId(inputId)).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)(undefined);

      render(input, { wrapper: wrapperFormProvider({ ...methods, errors, register: () => jest.fn() }) });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});
