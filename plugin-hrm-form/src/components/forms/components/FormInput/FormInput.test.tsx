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

import FormInput from './FormInput';
import { mockFormMethods, wrapperFormProvider } from '../../test-utils';

describe('FormInput', () => {
  describe('UI states', () => {
    test('if marked as required, asterisk is shown', async () => {
      const inputId = 'inputID';
      const methods = mockFormMethods();
      const updateCallback = jest.fn();

      render(
        <FormInput
          inputId={inputId}
          label="input label"
          initialValue=""
          isEnabled
          updateCallback={updateCallback}
          registerOptions={{ required: true }}
          htmlElRef={null}
        />,
        {
          wrapper: wrapperFormProvider(methods),
        },
      );

      expect(() => screen.getByLabelText('input label')).toThrow();
      const input = screen.getByLabelText('input label*');
      expect(input).toBeInTheDocument();

      expect(input).toHaveAttribute('aria-required', 'true');
    });

    test('if marked as disabled, inner input is disabled', async () => {
      const inputId = 'inputID';
      const methods = mockFormMethods();
      const updateCallback = jest.fn();

      render(
        <FormInput
          inputId={inputId}
          label="input label"
          initialValue=""
          isEnabled={false}
          updateCallback={updateCallback}
          registerOptions={{}}
          htmlElRef={null}
        />,
        {
          wrapper: wrapperFormProvider(methods),
        },
      );

      const input = screen.getByLabelText('input label');

      expect(input).toBeDisabled();
    });

    test('if in error state, error message is displayed', async () => {
      const inputId = 'inputID';
      const errors = { inputID: { message: 'some error message' } };
      const methods = mockFormMethods();
      const updateCallback = jest.fn();

      render(
        <FormInput
          inputId={inputId}
          label="input label"
          initialValue=""
          isEnabled={false}
          updateCallback={updateCallback}
          registerOptions={{}}
          htmlElRef={null}
        />,
        {
          wrapper: wrapperFormProvider({ ...methods, errors }),
          // wrapper: wrapperFormProvider(methods),
        },
      );

      expect(screen.getByText('some error message')).toBeInTheDocument();

      const input = screen.getByRole('textbox', { hidden: true });
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-errormessage');
    });
  });

  test('errors if not wrapped in FormProvider', async () => {
    const inputId = 'inputID';
    const updateCallback = jest.fn();

    expect(() =>
      render(
        <FormInput
          inputId={inputId}
          label="input label"
          initialValue=""
          isEnabled
          updateCallback={updateCallback}
          registerOptions={{}}
          htmlElRef={null}
        />,
      ),
    ).toThrow();
  });

  test('on render is registered, implementation is accessible', async () => {
    const inputId = 'inputID';
    const methods = mockFormMethods();
    const updateCallback = jest.fn();

    render(
      <FormInput
        inputId={inputId}
        label="input label"
        initialValue=""
        isEnabled
        updateCallback={updateCallback}
        registerOptions={{}}
        htmlElRef={null}
      />,
      {
        wrapper: wrapperFormProvider(methods),
      },
    );

    expect(methods.register).toHaveBeenCalled();

    const formItem = screen.getByTestId(`FormInput-${inputId}`);
    expect(formItem).toBeInTheDocument();

    // Expect the component to have an accessible label
    const input = screen.getByLabelText('input label');
    expect(input).toBeInTheDocument();

    // Expect the component to be implemented as an accessible input (textbox role)
    expect(getByRole(formItem, 'textbox', { hidden: true })).toBeInTheDocument();

    expect(input).toHaveAttribute('aria-required', 'false');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-errormessage');
  });

  test('updateCallback is invoked on blur', async () => {
    const inputId = 'inputID';
    const methods = mockFormMethods();
    const updateCallback = jest.fn();

    render(
      <FormInput
        inputId={inputId}
        label="input label"
        initialValue=""
        isEnabled
        updateCallback={updateCallback}
        registerOptions={{}}
        htmlElRef={null}
      />,
      {
        wrapper: wrapperFormProvider(methods),
      },
    );

    const input = screen.getByLabelText('input label');

    fireEvent.focus(input);

    fireEvent.change(input, {
      target: {
        value: 'Each day provides its own gifts.',
      },
    });

    expect(input).toHaveValue('Each day provides its own gifts.');
    expect(updateCallback).not.toHaveBeenCalled();

    fireEvent.blur(input);

    expect(updateCallback).toHaveBeenCalled();
  });
});
