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

import selectCaseHelplineData from '../../../states/case/selectCaseHelplineData';
import { RootState } from '../../../states';
import { namespace } from '../../../states/storeNamespaces';
import { RecursivePartial } from '../../RecursivePartial';

let state: RootState;
const CASE_ID = '1234';

beforeEach(() => {
  const partial: RecursivePartial<RootState> = {
    [namespace]: {
      connectedCase: {
        cases: {
          [CASE_ID]: {
            connectedCase: {
              helpline: 'Fakeline',
              info: {
                definitionVersion: 'demo-v1',
              },
            },
          },
        },
      },
      configuration: {
        definitionVersions: {
          'demo-v1': {
            helplineInformation: {
              helplines: [
                {
                  value: 'Fakeline',
                  label: 'Demo Fake Helpline',
                },
              ],
            },
          },
        },
        currentDefinitionVersion: {
          helplineInformation: {
            helplines: [
              {
                value: 'Fakeline',
                label: 'Default Fake Helpline',
              },
            ],
          },
        },
      },
    },
  };

  state = partial as RootState;
});

test('Case with ID exists in redux, and it has a valid definitionVersion and a helpline that exists in that definition - returns helpline entry from definition', () => {
  expect(selectCaseHelplineData(state, '1234').label).toBe('Demo Fake Helpline');
});

test('Case with ID exists in redux, and it has no definitionVersion set, but a helpline that exists in the current definition - returns helpline entry from current definition', () => {
  delete state[namespace].connectedCase.cases[CASE_ID].connectedCase.info.definitionVersion;
  expect(selectCaseHelplineData(state, '1234').label).toBe('Default Fake Helpline');
});

test("Case with ID exists in redux, and it has a definitionVersion set that isn't defined in configuration, but a helpline that exists in the current definition - returns helpline entry from current definition", () => {
  state[namespace].connectedCase.cases[CASE_ID].connectedCase.info.definitionVersion = 'v1';
  expect(selectCaseHelplineData(state, '1234').label).toBe('Default Fake Helpline');
});

test('Case with ID exists in redux, and it has a valid definitionVersion and but no helpline - returns undefined', () => {
  delete state[namespace].connectedCase.cases[CASE_ID].connectedCase.helpline;
  expect(selectCaseHelplineData(state, '1234')).toBeFalsy();
});

test('Case with ID exists in redux, and it has a valid definitionVersion and but helpline not defined in that version - returns undefined', () => {
  state[namespace].connectedCase.cases[CASE_ID].connectedCase.helpline = 'Missingline';
  expect(selectCaseHelplineData(state, '1234')).toBeFalsy();
});

test("Case with ID exists in redux, and it has no definitionVersion set and a helpline that doesn't exists in the current definition - returns undefined", () => {
  delete state[namespace].connectedCase.cases[CASE_ID].connectedCase.info.definitionVersion;
  state[namespace].connectedCase.cases[CASE_ID].connectedCase.helpline = 'Missingline';
  expect(selectCaseHelplineData(state, '1234')).toBeFalsy();
});

test('No case in redux state for ID- returns undefined', () => {
  expect(selectCaseHelplineData(state, '4321')).toBeFalsy();
});
