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

/* eslint-disable sonarjs/cognitive-complexity */
import * as React from 'react';
import each from 'jest-each';
import { FormInputType, FormItemDefinition } from 'hrm-form-definitions';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import '@testing-library/jest-dom/extend-expect';

import { getInputType } from '../../../../components/common/forms/formGenerators';
import HrmTheme from '../../../../styles/HrmTheme';

const themeConf = {
  colorTheme: HrmTheme,
};

const definition: FormItemDefinition = {
  type: FormInputType.ListboxMultiselect,
  name: 'test-input',
  label: 'test-input',
  options: [
    { value: 'Value 1', label: 'Value 1' },
    { value: 'Value 2', label: 'Value 2' },
    { value: 'Value 3', label: 'Value 3' },
  ],
};

const FormWrapper: React.FC<{}> = ({ children }) => {
  const methods = useForm();

  return (
    // @ts-ignore
    <StorelessThemeProvider themeConf={themeConf}>
      <FormProvider {...methods}>{children}</FormProvider>
    </StorelessThemeProvider>
  );
};

describe('listbox-multiselect', () => {
  test('Renders', async () => {
    const initialValue = [];

    const input = getInputType([], () => undefined)(definition)(initialValue);

    render(<FormWrapper>{input}</FormWrapper>);

    expect(screen.getByTestId(`listbox-multiselect-${definition.name}`)).toBeInTheDocument();
    definition.options.forEach(o =>
      expect(screen.getByTestId(`listbox-multiselect-option-${definition.name}-${o.value}`)).toBeInTheDocument(),
    );
  });

  describe('Test values are handled properly', () => {
    type TestCase = {
      description: string;
      testCallback: (optionsInputs: HTMLInputElement[], spyUpdateCallback: () => void) => Promise<void>;
      def?: typeof definition;
      initialValue?: typeof definition['options'];
    };

    const testCases: TestCase[] = [
      {
        description: 'On mount all initialized options are unchecked',
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          expect(optionsInputs).toHaveLength(3);
          optionsInputs.forEach(o => expect(o.checked).toBeFalsy());

          expect(spyUpdateCallback).not.toHaveBeenCalled();
        },
      },
      {
        description: 'Checking & unchecking one item works as expected',
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          const [o1, ...rest] = optionsInputs;

          // Check first item
          o1.click();
          expect(o1.checked).toBeTruthy();
          rest.forEach(o => expect(o.checked).toBeFalsy());

          // Uncheck first item
          o1.click();
          expect(o1.checked).toBeFalsy();
          rest.forEach(o => expect(o.checked).toBeFalsy());

          expect(spyUpdateCallback).toHaveBeenCalledTimes(2);
        },
      },
      {
        description: 'Checking & unchecking multiple items works as expected',
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          // Check first and last items
          optionsInputs[0].click();
          optionsInputs[2].click();
          expect(optionsInputs[0].checked).toBeTruthy();
          expect(optionsInputs[1].checked).toBeFalsy();
          expect(optionsInputs[2].checked).toBeTruthy();

          // Uncheck first and last items
          optionsInputs[0].click();
          optionsInputs[2].click();
          expect(optionsInputs[0].checked).toBeFalsy();
          expect(optionsInputs[1].checked).toBeFalsy();
          expect(optionsInputs[2].checked).toBeFalsy();

          expect(spyUpdateCallback).toHaveBeenCalledTimes(4);
        },
      },
      {
        description: 'On mount with initialValues, pertinent options are checked',
        def: definition,
        initialValue: [definition.options[1].value],
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          expect(optionsInputs).toHaveLength(3);

          expect(optionsInputs[0].checked).toBeFalsy();
          expect(optionsInputs[1].checked).toBeTruthy();
          expect(optionsInputs[2].checked).toBeFalsy();

          expect(spyUpdateCallback).not.toHaveBeenCalled();
        },
      },
      {
        description: 'On mount with initialValues, unchecking works as expected',
        def: definition,
        initialValue: [definition.options[1].value],
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          expect(optionsInputs).toHaveLength(3);

          // Uncheck the initially checked item
          optionsInputs[1].click();
          optionsInputs.forEach(o => expect(o.checked).toBeFalsy());

          expect(spyUpdateCallback).toHaveBeenCalledTimes(1);
        },
      },
      {
        description: 'Focus in works as expected when all unchecked (focus first element)',
        def: definition,
        initialValue: [],
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          const inputAbove = screen.getByTestId('input-above');

          inputAbove.focus();

          await userEvent.tab();

          expect(optionsInputs[0]).toHaveFocus();
        },
      },
      {
        description: 'Focus in works as expected when some are checked (focus first selected element)',
        def: definition,
        initialValue: [definition.options[1].value, definition.options[2].value],
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          const inputAbove = screen.getByTestId('input-above');

          inputAbove.focus();

          await userEvent.tab();

          expect(optionsInputs[1]).toHaveFocus();
        },
      },
      ...[
        {
          description: 'Focus out works as expected when all unchecked (move to next element)',
          def: definition,
          initialValue: [],
        },
        {
          description: 'Focus out works as expected when some checked (move to next element)',
          def: definition,
          initialValue: [definition.options[1].value, definition.options[2].value],
        },
      ].map(t => ({
        ...t,
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          const inputAbove = screen.getByTestId('input-above');
          const inputBelow = screen.getByTestId('input-below');

          inputAbove.focus();

          const expectedFocusedOptionIndex = t.initialValue.length
            ? optionsInputs.map(e => e.value).indexOf(t.initialValue[0])
            : 0;

          // Move in the listbox
          await userEvent.tab();

          expect(optionsInputs[expectedFocusedOptionIndex]).toHaveFocus();

          // Move out of the listbox
          await userEvent.tab();

          expect(inputBelow).toHaveFocus();
        },
      })),
      ...[
        {
          description: 'Arrow down navigation works as expected when all unchecked (move to next option)',
          def: definition,
          initialValue: [],
          keyPress: 'ArrowDown',
        },
        {
          description: 'Arrow down navigation works as expected when some checked (move to next option)',
          def: definition,
          initialValue: [definition.options[1].value, definition.options[2].value],
          keyPress: 'ArrowDown',
        },
        {
          description: 'Arrow down navigation works as expected when last is checked (move to first option)',
          def: definition,
          initialValue: [definition.options[1].value, definition.options[2].value],
          keyPress: 'ArrowDown',
        },
        {
          description: 'Arrow up navigation works as expected when all unchecked (move to last option)',
          def: definition,
          initialValue: [],
          keyPress: 'ArrowUp',
        },
        {
          description: 'Arrow up navigation works as expected when some checked (move to previous option)',
          def: definition,
          initialValue: [definition.options[1].value, definition.options[2].value],
          keyPress: 'ArrowUp',
        },
      ].map(t => ({
        ...t,
        testCallback: async (optionsInputs, spyUpdateCallback) => {
          const inputAbove = screen.getByTestId('input-above');
          const listbox = screen.getByTestId(`listbox-multiselect-${definition.name}`);

          inputAbove.focus();

          const expectedFocusedOptionIndex = t.initialValue.length
            ? optionsInputs.map(e => e.value).indexOf(t.initialValue[0])
            : 0;

          const expectedNextFocusedOptionIndex =
            // eslint-disable-next-line no-nested-ternary
            t.keyPress === 'ArrowDown'
              ? expectedFocusedOptionIndex + 1 < definition.options.length
                ? expectedFocusedOptionIndex + 1
                : 0
              : expectedFocusedOptionIndex - 1 >= 0
              ? expectedFocusedOptionIndex - 1
              : definition.options.length - 1;

          // Move in the listbox
          await userEvent.tab();

          expect(optionsInputs[expectedFocusedOptionIndex]).toHaveFocus();

          fireEvent.keyDown(optionsInputs[expectedFocusedOptionIndex], { key: t.keyPress });

          expect(optionsInputs[expectedNextFocusedOptionIndex]).toHaveFocus();
        },
      })),
    ];

    each(testCases).test('$description', async ({ def = definition, initialValue = [], testCallback }: TestCase) => {
      const spyUpdateCallback = jest.fn();

      const input = getInputType([], spyUpdateCallback)(def)(initialValue);

      render(
        <FormWrapper>
          <input data-testid="input-above" />
          {input}
          <input data-testid="input-below" />
        </FormWrapper>,
      );

      const optionsInputs = def.options.map(
        o => screen.getByTestId(`listbox-multiselect-option-${def.name}-${o.value}`) as HTMLInputElement,
      );

      await testCallback(optionsInputs, spyUpdateCallback);
    });
  });
});
