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

import RadioInput from './RadioInput';
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
  { value: 'option-a', label: 'Option A' },
  { value: 'option-b', label: 'Option B' },
];
const defaultProps = {
  inputId,
  label,
  initialValue: '',
  isEnabled: true,
  updateCallback: jest.fn(),
  registerOptions: {},
  htmlElRef: null,
  options,
};

describe('RadioInput', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<RadioInput {...defaultProps} />)).toThrow();
  });

  test('on render, all options are accessible', () => {
    const methods = createFormMethods();

    render(<RadioInput {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    const formItem = screen.getByTestId(`RadioInput-${inputId}`);
    expect(formItem).toBeInTheDocument();

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(options.length);

    options.forEach(option => {
      expect(screen.getByTestId(`${inputId}-${option.value}`)).toBeInTheDocument();
    });
  });

  test('updateCallback is invoked on change', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<RadioInput {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const firstRadio = screen.getAllByRole('radio')[0];
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.click(firstRadio);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      const { container } = render(<RadioInput {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      // RequiredAsterisk renders aria-hidden span with "*"
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, radio inputs are disabled', () => {
      const methods = createFormMethods();

      render(<RadioInput {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      // The fieldset is disabled, which disables all radio inputs within it
      const fieldset = screen.getByTestId(`RadioInput-${inputId}`);
      expect(fieldset).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<RadioInput {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});

describe('RadioInput via getInputType (parity)', () => {
  const def = {
    type: 'radio-input' as any,
    name: inputId,
    label,
    options,
  };

  test('on render, all options are accessible', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(options.length);

    options.forEach(option => {
      expect(screen.getByTestId(`${inputId}-${option.value}`)).toBeInTheDocument();
    });
  });

  test('updateCallback is invoked on change', () => {
    const updateCallback = jest.fn();
    const methods = createFormMethods();

    const input = getInputType([], updateCallback)(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const firstRadio = screen.getAllByRole('radio')[0];
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.click(firstRadio);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();
      const requiredDef = { ...def, required: true };

      const input = getInputType([], jest.fn())(requiredDef)('');

      const { container } = render(input, {
        wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }),
      });

      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, radio inputs are disabled', () => {
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)('', null, false);

      render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

      // The fieldset is disabled
      const fieldset = screen.getByRole('group');
      expect(fieldset).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)('');

      render(input, { wrapper: wrapperFormProvider({ ...methods, errors, register: () => jest.fn() }) });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});
