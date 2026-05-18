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
import each from 'jest-each';

import DateInput from '../../../../../components/forms/components/DateInput/DateInput';
import TimeInput from '../../../../../components/forms/components/DateInput/TimeInput';
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

describe('DateInput', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<DateInput {...defaultProps} />)).toThrow();
  });

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();

    render(<DateInput {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    const formItem = screen.getByTestId(`DateInput-${inputId}`);
    expect(formItem).toBeInTheDocument();

    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'date');
  });

  test('updateCallback is invoked on blur', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<DateInput {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const input = screen.getByLabelText(label);
    fireEvent.focus(input);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      render(<DateInput {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(() => screen.getByLabelText(label)).toThrow();
      const input = screen.getByLabelText(`${label}*`);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('if marked as disabled, date input is disabled', () => {
      const methods = createFormMethods();

      render(<DateInput {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(screen.getByLabelText(label)).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<DateInput {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();
      expect(screen.getByTestId(inputId)).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

describe('TimeInput', () => {
  test('errors if not wrapped in FormProvider', () => {
    expect(() => render(<TimeInput {...defaultProps} />)).toThrow();
  });

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();

    render(<TimeInput {...defaultProps} />, {
      wrapper: wrapperFormProvider(methods),
    });

    expect(methods.register).toHaveBeenCalled();

    const formItem = screen.getByTestId(`TimeInput-${inputId}`);
    expect(formItem).toBeInTheDocument();

    const input = screen.getByLabelText(label);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'time');
  });

  test('updateCallback is invoked on blur', () => {
    const methods = createFormMethods();
    const updateCallback = jest.fn();

    render(<TimeInput {...defaultProps} updateCallback={updateCallback} />, {
      wrapper: wrapperFormProvider(methods),
    });

    const input = screen.getByLabelText(label);
    fireEvent.focus(input);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(updateCallback).toHaveBeenCalled();
  });

  describe('UI states', () => {
    test('if marked as required, asterisk is shown', () => {
      const methods = createFormMethods();

      render(<TimeInput {...defaultProps} registerOptions={{ required: true }} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(() => screen.getByLabelText(label)).toThrow();
      const input = screen.getByLabelText(`${label}*`);
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('if marked as disabled, time input is disabled', () => {
      const methods = createFormMethods();

      render(<TimeInput {...defaultProps} isEnabled={false} />, {
        wrapper: wrapperFormProvider(methods),
      });

      expect(screen.getByLabelText(label)).toBeDisabled();
    });

    test('if in error state, error message is displayed', () => {
      const errors = { [inputId]: { message: 'some error message' } };
      const methods = createFormMethods();

      render(<TimeInput {...defaultProps} />, {
        wrapper: wrapperFormProvider({ ...methods, errors }),
      });

      expect(screen.getByText('some error message')).toBeInTheDocument();
      expect(screen.getByTestId(inputId)).toHaveAttribute('aria-invalid', 'true');
    });
  });
});

/**
 * DateInput and TimeInput share the same DateTimeInputUI, so their parity tests
 * against getInputType are parameterized to avoid duplication.
 */
each([
  { typeName: 'DateInput', defType: 'date-input', expectedInputType: 'date' },
  { typeName: 'TimeInput', defType: 'time-input', expectedInputType: 'time' },
]).describe('$typeName via getInputType (parity)', ({ defType, expectedInputType }) => {
  const def = { type: defType as any, name: inputId, label };

  test('on render, implementation is accessible', () => {
    const methods = createFormMethods();

    const input = getInputType([], jest.fn())(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const dateTimeInput = screen.getByLabelText(label);
    expect(dateTimeInput).toBeInTheDocument();
    expect(dateTimeInput).toHaveAttribute('type', expectedInputType);
  });

  test('updateCallback is invoked on blur', () => {
    const updateCallback = jest.fn();
    const methods = createFormMethods();

    const input = getInputType([], updateCallback)(def)('');

    render(input, { wrapper: wrapperFormProvider({ ...methods, register: () => jest.fn() }) });

    const dateTimeInput = screen.getByLabelText(label);
    fireEvent.focus(dateTimeInput);
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(dateTimeInput);
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

    test('if marked as disabled, input is disabled', () => {
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
