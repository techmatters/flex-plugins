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

import ListboxMultiselect from './ListboxMultiselect';
import { getInputType } from '../../../common/forms/formGenerators';
import { createFormMethods, wrapperFormProvider } from '../../test-utils';

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
const options = [
  { value: 'value-1', label: 'Value 1' },
  { value: 'value-2', label: 'Value 2' },
  { value: 'value-3', label: 'Value 3' },
];
const defaultProps = {
  inputId,
  label,
  initialValue: [],
  isEnabled: true,
  updateCallback: jest.fn(),
  registerOptions: {},
  htmlElRef: null,
  options,
};

describe('ListboxMultiselect', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<ListboxMultiselect {...defaultProps} />)).toThrow();
  });

  test('on render, all options are accessible', () => {
    const methods = createFormMethods();

    render(<ListboxMultiselect {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    const listbox = screen.getByTestId(`ListboxMultiselect-${inputId}`);
    expect(listbox).toBeInTheDocument();
    expect(listbox).toHaveAttribute('role', 'listbox');
    expect(listbox).toHaveAttribute('aria-multiselectable');

    options.forEach(option => {
      expect(screen.getByTestId(`ListboxMultiselect-option-${inputId}-${option.value}`)).toBeInTheDocument();
    });
  });

  test('updateCallback is invoked on change', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<ListboxMultiselect {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const firstCheckbox = screen.getByTestId(
      `ListboxMultiselect-option-${inputId}-${options[0].value}`,
    ) as HTMLInputElement;

    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.click(firstCheckbox);
    expect(updateCallback).toHaveBeenCalled();
  });

  test('on mount all options are unchecked', () => {
    const methods = createFormMethods();

    render(<ListboxMultiselect {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const checkboxes = options.map(
      o => screen.getByTestId(`ListboxMultiselect-option-${inputId}-${o.value}`) as HTMLInputElement,
    );
    checkboxes.forEach(cb => expect(cb.checked).toBeFalsy());
  });

  test('checking and unchecking an option works', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<ListboxMultiselect {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const checkbox = screen.getByTestId(`ListboxMultiselect-option-${inputId}-${options[0].value}`) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(updateCallback).toHaveBeenCalledTimes(1);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(updateCallback).toHaveBeenCalledTimes(2);
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      const { container } = render(<ListboxMultiselect {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, checkboxes are disabled', () => {
      const methods = createFormMethods();

      render(<ListboxMultiselect {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      options.forEach(option => {
        const checkbox = screen.getByTestId(`ListboxMultiselect-option-${inputId}-${option.value}`) as HTMLInputElement;
        expect(checkbox).toBeDisabled();
      });
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<ListboxMultiselect {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});

describe('ListboxMultiselect via getInputType (parity)', () => {
  const def = {
    type: 'listbox-multiselect' as any,
    name: inputId,
    label,
    options,
  };

  test('on render, all options are accessible', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)([]);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    // Old code uses data-testid="listbox-multiselect-{name}" (not "ListboxMultiselect-{name}")
    expect(screen.getByTestId(`listbox-multiselect-${inputId}`)).toBeInTheDocument();

    options.forEach(option => {
      expect(screen.getByTestId(`listbox-multiselect-option-${inputId}-${option.value}`)).toBeInTheDocument();
    });
  });

  test('updateCallback is invoked on change', () => {
    const updateCallback = jest.fn();
    const methods = createFormMethods();

    const input = getInputType([], updateCallback)(def)([]);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const firstCheckbox = screen.getByTestId(
      `listbox-multiselect-option-${inputId}-${options[0].value}`,
    ) as HTMLInputElement;

    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.click(firstCheckbox);
    expect(updateCallback).toHaveBeenCalled();
  });

  test('on mount all options are unchecked', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)([]);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const checkboxes = options.map(
      o => screen.getByTestId(`listbox-multiselect-option-${inputId}-${o.value}`) as HTMLInputElement,
    );
    checkboxes.forEach(cb => expect(cb.checked).toBeFalsy());
  });

  test('checking and unchecking an option works', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    const input = getInputType([], updateCallback)(def)([]);

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const checkbox = screen.getByTestId(
      `listbox-multiselect-option-${inputId}-${options[0].value}`,
    ) as HTMLInputElement;

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(updateCallback).toHaveBeenCalledTimes(1);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(updateCallback).toHaveBeenCalledTimes(2);
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();
      const requiredDef = { ...def, required: true };

      const input = getInputType([], jest.fn())(requiredDef)([]);

      const { container } = render(input, {
        wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }),
      });

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, checkboxes are disabled', () => {
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)([], null, false);

      render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

      options.forEach(option => {
        const checkbox = screen.getByTestId(
          `listbox-multiselect-option-${inputId}-${option.value}`,
        ) as HTMLInputElement;
        expect(checkbox).toBeDisabled();
      });
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)([]);

      render(input, { wrapper: wrapperFormProvider({ ...methods, errors, register: () => jest.fn() }) });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});
