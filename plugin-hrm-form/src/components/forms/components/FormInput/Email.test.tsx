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
import { render, screen, fireEvent, getByRole } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Email from './Email';
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
const defaultProps = {
  inputId,
  label,
  initialValue: '',
  isEnabled: true,
  updateCallback: jest.fn(),
  registerOptions: {},
  htmlElRef: null,
};

describe('Email', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<Email {...defaultProps} />)).toThrow();
  });

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<Email {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    // Email reuses FormInputUI, so testid is "FormInput-{inputId}"
    const formItem = screen.getByTestId(`FormInput-${inputId}`);
    expect(formItem).toBeInTheDocument();

    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();

    expect(getByRole(formItem, 'textbox', { hidden: true })).toBeInTheDocument();

    expect(input).toHaveAttribute('aria-required', 'false');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-errormessage');
  });

  test('register is called with email pattern', () => {
    const methods = createFormMethods();

    render(<Email {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const registerCallArgs = (methods.register as jest.Mock).mock.calls;
    expect(registerCallArgs.length).toBeGreaterThan(0);
    const registeredOptions = registerCallArgs[0][0];
    expect(registeredOptions.pattern).toBeDefined();
    expect(registeredOptions.pattern.value).toEqual(/\S+@\S+\.\S+/);
  });

  test('updateCallback is invoked on blur', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<Email {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const input = screen.getByLabelText(label);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      render(<Email {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(() => screen.getByLabelText(label)).toThrow();
      const input = screen.getByLabelText(`${label}*`);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('if marked as disabled, inner input is disabled', () => {
      const methods = createFormMethods();

      render(<Email {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(screen.getByLabelText(label)).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<Email {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();

      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-errormessage');
    });
  });
});

describe('Email via getInputType (parity)', () => {
  const def = {
    type: 'email' as any,
    name: inputId,
    label,
  };

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    expect(screen.getByRole('textbox', { hidden: true })).toBeInTheDocument();
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  test('updateCallback is invoked on blur', () => {
    const updateCallback = jest.fn();
    const methods = createFormMethods();

    const input = getInputType([], updateCallback)(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const textbox = screen.getByLabelText(label);
    fireEvent.focus(textbox);
    fireEvent.change(textbox, { target: { value: 'test@example.com' } });
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(textbox);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();
      const requiredDef = { ...def, required: true };

      const input = getInputType([], jest.fn())(requiredDef)('');

      render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

      expect(screen.getByLabelText(`${label}*`)).toBeInTheDocument();
    });

    test('if marked as disabled, inner input is disabled', () => {
      const methods = createFormMethods();

      const input = getInputType([], jest.fn())(def)('', null, false);

      render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

      expect(screen.getByLabelText(label)).toBeDisabled();
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
