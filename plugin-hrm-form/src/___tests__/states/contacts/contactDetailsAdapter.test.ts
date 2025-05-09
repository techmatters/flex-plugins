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

import { FormInputType } from '@tech-matters/hrm-form-definitions';

import { transformValues } from '../../../states/contacts/contactDetailsAdapter';

describe('transformValues', () => {
  test('Strips entries in formValues that are not defined in provided form definition and adds undefined entries for form items without values', () => {
    const result = transformValues([
      { name: 'input1', type: FormInputType.Input, label: '' },
      { name: 'input2', type: FormInputType.Input, label: '' },
      { name: 'input3', type: FormInputType.Input, label: '' },
      { name: 'input4', type: FormInputType.Input, label: '' },
    ])({
      input1: 'something',
      input2: 'something else',
      input3: 'another thing',
      notInDef: 'delete me',
    });

    expect(result).toStrictEqual({
      input1: 'something',
      input2: 'something else',
      input3: 'another thing',
      input4: undefined,
    });
  });
  test("Converts 'mixed' values to nulls for mixed-checkbox types", () => {
    const result = transformValues([
      { name: 'mixed1', type: FormInputType.MixedCheckbox, label: '' },
      { name: 'mixed2', type: FormInputType.MixedCheckbox, label: '' },
      { name: 'mixed3', type: FormInputType.MixedCheckbox, label: '' },
      { name: 'notMixed', type: FormInputType.Input, label: '' },
    ])({
      mixed1: 'mixed',
      mixed2: true,
      mixed3: false,
      notMixed: 'mixed',
    });

    expect(result).toStrictEqual({
      mixed1: null,
      mixed2: true,
      mixed3: false,
      notMixed: 'mixed',
    });
  });
});
