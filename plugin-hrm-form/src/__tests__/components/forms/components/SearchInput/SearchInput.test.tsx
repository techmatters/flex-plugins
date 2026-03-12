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

import SearchInput from '../../../../../components/forms/components/SearchInput/SearchInput';
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
  initialValue: '',
  isEnabled: true,
  updateCallback: jest.fn(),
  registerOptions: {},
  htmlElRef: null,
};

describe('SearchInput', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<SearchInput {...defaultProps} />)).toThrow();
  });

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<SearchInput {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    const formItem = screen.getByTestId(`SearchInput-${inputId}`);
    expect(formItem).toBeInTheDocument();

    // Search input has an explicit aria-label="Search"
    const input = screen.getByRole('search');
    expect(input).toBeInTheDocument();
  });

  test('updateCallback is invoked on blur', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<SearchInput {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const input = screen.getByRole('search');

    fireEvent.focus(input);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      const { container } = render(<SearchInput {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      // RequiredAsterisk renders aria-hidden span with "*"
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    test('if marked as disabled, search input is disabled', () => {
      const methods = createFormMethods();

      render(<SearchInput {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(screen.getByRole('search')).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<SearchInput {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();
    });
  });
});

describe('SearchInput via getInputType (parity)', () => {
  const def = {
    type: 'search-input' as any,
    name: inputId,
    label,
  };

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    // Old search input also has role="search" and aria-label="Search"
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  test('updateCallback is invoked on blur', () => {
    const updateCallback = jest.fn();
    const methods = createFormMethods();

    const input = getInputType([], updateCallback)(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const searchInput = screen.getByRole('search');
    fireEvent.focus(searchInput);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(searchInput);
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

    test('if marked as disabled, search input is disabled', () => {
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)('', null, false);

      render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

      expect(screen.getByRole('search')).toBeDisabled();
    });

    /**
     * NOTE: The old SearchInput (getInputType) does not render an error message text element.
     * The new SearchInput adds this behavior as an improvement. This test verifies
     * the component still renders without errors when in error state.
     */
    test('if in error state, component still renders', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)('');

      render(input, { wrapper: wrapperFormProvider({ ...methods, errors, register: () => jest.fn() }) });

      expect(screen.getByRole('search')).toBeInTheDocument();
    });
  });
});
