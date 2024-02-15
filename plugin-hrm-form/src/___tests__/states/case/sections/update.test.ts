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

import each from 'jest-each';
import {
  DefinitionVersion,
  DefinitionVersionId,
  FormDefinition,
  loadDefinition,
  useFetchDefinitions,
} from 'hrm-form-definitions';
import { addSeconds } from 'date-fns';

import { CaseInfo, CaseItemEntry, HouseholdEntry, PerpetratorEntry, ReferralEntry } from '../../../../types/types';
import {
  copyCaseSectionItem,
  upsertCaseSectionItem,
  upsertCaseSectionItemUsingSectionName,
} from '../../../../states/case/sections/update';
import { CaseSectionApi } from '../../../../states/case/sections/api';
import { householdSectionApi } from '../../../../states/case/sections/household';
import { perpetratorSectionApi } from '../../../../states/case/sections/perpetrator';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

const testCaseItemEntry = (payload: any, id: string = 'TEST_CASE_INFO_SECTION'): CaseItemEntry => ({
  form: payload,
  id,
  createdAt: new Date(2000, 1, 1).toISOString(),
  twilioWorkerId: 'TEST_CASE_INFO_WORKER',
});

const expectedUpdatedCaseItem = (item: CaseItemEntry, property: string, id: string = undefined) => {
  const { form, ...entry } = item;
  return { [property]: form, ...entry, id: id ?? entry.id };
};

beforeEach(() => {
  mockReset();
});

describe('upsertCaseSectionItemUsingSectionName', () => {
  const testCase = () => ({
    case: { childIsAtRisk: false },
    description: 'case with no list defined',
  });
  const testCaseWithList = () => ({
    case: { referrals: [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }] },
    description: 'case with populated list',
  });

  const payload = {};

  each([
    {
      entryProperty: undefined,
      baselineCase: testCase(),
      expectedList: [expectedUpdatedCaseItem(testCaseItemEntry(payload), 'referrals')],
      expectationDescription: "a new list with the provided item as it's only item to be created",
    },
    {
      entryProperty: undefined,
      baselineCase: testCaseWithList(),
      expectedList: [
        ...testCaseWithList().case.referrals,
        expectedUpdatedCaseItem(testCaseItemEntry(payload), 'referrals'),
      ],
      expectationDescription: 'the provided item to be added to the end of the existing list',
    },
    {
      entryProperty: 'myEntry',
      baselineCase: testCase(),
      expectedList: [expectedUpdatedCaseItem(testCaseItemEntry(payload), 'myEntry')],
      expectationDescription: "a new list with the provided item as it's only item to be created",
    },
    {
      entryProperty: 'myEntry',
      baselineCase: testCaseWithList(),
      expectedList: [
        ...testCaseWithList().case.referrals,
        expectedUpdatedCaseItem(testCaseItemEntry(payload), 'myEntry'),
      ],
      expectationDescription: 'the provided item to be added to the end of the existing list',
    },
    {
      entryProperty: 'myEntry',
      id: '2',
      baselineCase: testCaseWithList(),
      expectedList: [
        { id: '0' },
        { id: '1' },
        expectedUpdatedCaseItem(testCaseItemEntry(payload, '2'), 'myEntry', '2'),
        { id: '3' },
      ],
      expectationDescription: 'the provided item to replace the item with a matching id in the existing list',
    },
  ]).test(
    `Running on $baselineCase.description, Specifying index: $index, entryProperty: '$entryProperty' - expect the item to have it's payload moved from 'form' to '$entryProperty' and $expectationDescription`,
    ({ baselineCase, expectedList, entryProperty, id }) => {
      const updatedCase = upsertCaseSectionItemUsingSectionName('referrals', entryProperty)(
        baselineCase.case,
        testCaseItemEntry(payload, id ?? 'TEST_CASE_INFO_SECTION'),
      );
      expect(updatedCase).toHaveProperty('referrals', expectedList);
      expect(payload).not.toHaveProperty('referrals');
    },
  );
  test(`Keeps entry property on form when explicitly set to`, () => {
    const updatedCase = upsertCaseSectionItemUsingSectionName('referrals', 'form')(
      testCase().case,
      testCaseItemEntry(payload),
    );
    expect(updatedCase).toHaveProperty('referrals', [expectedUpdatedCaseItem(testCaseItemEntry(payload), 'form')]);
    expect(payload).not.toHaveProperty('referrals');
  });
  test(`Throws if list property set to non array case property`, () => {
    expect(() =>
      upsertCaseSectionItemUsingSectionName('childIsAtRisk', 'form')(testCase().case, testCaseItemEntry(payload)),
    ).toThrow();
  });
});

describe('upsertCaseSectionItem', () => {
  const testCase = () => ({
    case: { referrals: [] },
    description: 'case with no list defined',
  });
  const testCaseWithList = () => ({
    case: { referrals: [{ id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }] },
    description: 'case with populated list',
  });

  const payload = {
    hello: 'world',
    referredTo: 'bob',
    date: new Date(2000, 10, 5).toISOString(),
  };
  const convertedReferral: ReferralEntry = {
    ...payload,
    createdAt: new Date(2000, 10, 4).toISOString(),
    twilioWorkerId: 'TEST_CASE_INFO_WORKER',
    id: 'TEST_CASE_INFO_SECTION',
  };
  const caseItemToListItem: (item: CaseItemEntry) => ReferralEntry = (item: CaseItemEntry) => ({
    ...convertedReferral,
    id: item.id,
  });

  // Need to be assigned before 'beforeEach' runs, but also be reset for each test.

  each([
    {
      baselineCase: testCaseWithList(),
      expectedList: [...testCaseWithList().case.referrals, convertedReferral],
      expectationDescription: 'the provided item to be added to the end of the returned list',
    },
    {
      id: '2',
      baselineCase: testCase(),
      expectedList: [{ ...convertedReferral, id: '2' }],
      expectationDescription: "a list with the provided item as it's only item to be created",
    },
    {
      id: '2',
      baselineCase: testCaseWithList(),
      expectedList: [{ id: '0' }, { id: '1' }, { ...convertedReferral, id: '2' }, { id: '3' }],
      expectationDescription: 'the provided item to replace the item in the existing list with a matching id',
    },
  ]).test(
    `Running on $baselineCase.description, Specifying index: $index - expect the item to be converted by the 'caseItemToListItem' function parameter and and $expectationDescription`,
    ({ baselineCase, expectedList, id }) => {
      const updatedCase = upsertCaseSectionItem(caseInfo => caseInfo.referrals, caseItemToListItem)(
        baselineCase.case,
        testCaseItemEntry(payload, id),
      );
      expect(updatedCase).toHaveProperty('referrals', expectedList);
      expect(payload).not.toHaveProperty('referrals');
    },
  );

  test(`Throws if listGetter returns nothing`, () => {
    expect(() =>
      upsertCaseSectionItem(() => undefined, caseItemToListItem)(testCase().case, testCaseItemEntry(payload)),
    ).toThrow();
  });
});

describe('copyCaseSection', () => {
  const testCase = {
    childIsAtRisk: false,
  };

  const inputHousehold = (
    id: string,
    form: Record<string, boolean | string>,
    secondsAfterBaseline: number = 0,
  ): HouseholdEntry => ({
    createdAt: addSeconds(new Date(20120, 5, 15), secondsAfterBaseline).toISOString(),
    household: form,
    twilioWorkerId: 'HOUSEHOLD_MEMBER_CREATOR',
    id,
  });

  const expectedPerpetrator = (
    id: string,
    form: Record<string, boolean | string>,
    secondsAfterBaseline: number = 0,
  ): PerpetratorEntry => ({
    createdAt: addSeconds(new Date(20120, 5, 15), secondsAfterBaseline).toISOString(),
    perpetrator: form,
    twilioWorkerId: 'HOUSEHOLD_MEMBER_CREATOR',
    id,
  });

  const toFormDefinition = (names: string[]): FormDefinition => names.map(name => ({ name, label: '', type: 'input' }));

  let demoV1: DefinitionVersion;
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.demoV1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    demoV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  type Params = {
    originalCase: CaseInfo;
    expectedCase: (original: CaseInfo) => CaseInfo;
    sourceDefinition: FormDefinition;
    targetDefinition: FormDefinition;
    fromId?: string;
    fromApiOverrides?: Partial<CaseSectionApi>;
    toApiOverrides?: Partial<CaseSectionApi>;
    description: string;
  };

  const testCaseParameters: Params[] = [
    {
      description:
        'Empty target list, fully matched definitions - new list created with single item fully copied from source',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: true })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'b', b: true })],
      }),
    },
    {
      description:
        'Empty target list, item only present in source definition - item missing in target definition is not copied',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['b']),
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: true })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { b: true })],
      }),
    },
    {
      description:
        'Empty target list, item only present in target definition - item missing in source definition is not copied',
      sourceDefinition: toFormDefinition(['a']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: true })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'b' })],
      }),
    },
    {
      description: 'Empty target list, item present in both definitions but types are mismatched - item not copied',
      sourceDefinition: [...toFormDefinition(['a']), { name: 'b', type: 'mixed-checkbox', label: '' }],
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: true })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'b' })],
      }),
    },
    {
      description:
        'Empty target list, list item present in both definitions and a valid option in the target is selected - item copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'select',
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val2', label: '' },
          ],
        },
      ],
      targetDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'select',
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val2', label: '' },
          ],
        },
      ],
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: 'val2' })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'b', b: 'val2' })],
      }),
    },
    {
      description:
        'Empty target list, list item present in both definitions and an option not defined in the target is selected - item not copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'select',
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val2', label: '' },
          ],
        },
      ],
      targetDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'select',
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val3', label: '' },
          ],
        },
      ],
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: 'val2' })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'b' })],
      }),
    },
    {
      description:
        'Empty target list, multi-select list item present in both definitions - only selection present in the target list are copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'listbox-multiselect',
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val2', label: '' },
            { value: 'val3', label: '' },
          ],
        },
      ],
      targetDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'listbox-multiselect',
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val3', label: '' },
          ],
        },
      ],
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'b', b: <any>['val1', 'val2'] })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'b', b: <any>['val1'] })],
      }),
    },
    {
      description:
        'Empty target list, dependent select list item present in both definitions, valid selection and dependent selection for target - item copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'dependent-select',
          label: '',
          dependsOn: 'a',
          defaultOption: { value: 'val1', label: '' },
          options: {
            dependedVal1: [
              { value: 'val1', label: '' },
              { value: 'val2', label: '' },
            ],
            dependedVal2: [{ value: 'val3', label: '' }],
          },
        },
      ],
      targetDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'dependent-select',
          label: '',
          dependsOn: 'a',
          defaultOption: { value: 'val1', label: '' },
          options: {
            dependedVal1: [
              { value: 'val1', label: '' },
              { value: 'val2', label: '' },
            ],
            dependedVal2: [{ value: 'val3', label: '' }],
          },
        },
      ],
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'dependedVal1', b: 'val2' })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'dependedVal1', b: 'val2' })],
      }),
    },
    {
      description:
        'Empty target list, dependent select list item present in both definitions, value is valid option but invalid for depended selection on target - item not copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'dependent-select',
          label: '',
          dependsOn: 'a',
          defaultOption: { value: 'val1', label: '' },
          options: {
            dependedVal1: [
              { value: 'val1', label: '' },
              { value: 'val2', label: '' },
            ],
            dependedVal2: [{ value: 'val3', label: '' }],
          },
        },
      ],
      targetDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: 'dependent-select',
          label: '',
          dependsOn: 'a',
          defaultOption: { value: 'val1', label: '' },
          options: {
            dependedVal1: [{ value: 'val1', label: '' }],
            dependedVal2: [
              { value: 'val2', label: '' },
              { value: 'val3', label: '' },
            ],
          },
        },
      ],
      originalCase: { ...testCase, households: [inputHousehold('NEW', { a: 'dependedVal1', b: 'val2' })] },
      expectedCase: o => ({
        ...o,
        perpetrators: [expectedPerpetrator('NEW', { a: 'dependedVal1' })],
      }),
    },
    {
      description:
        'Populated target list without matching ID, fully matched definitions - copied item appended to target list',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        households: [inputHousehold('NEW', { a: 'b', b: true })],
        perpetrators: [expectedPerpetrator('EXISTING', {})],
      },
      expectedCase: o => ({
        ...o,
        perpetrators: [...o.perpetrators, expectedPerpetrator('NEW', { a: 'b', b: true })],
      }),
    },
    {
      description:
        'Populated target list matching ID, fully matched definitions - overwrites item in target list with matching id',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        households: [inputHousehold('EXISTING_2', { a: 'b', b: true })],
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      },
      expectedCase: o => ({
        ...o,
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', { a: 'b', b: true }),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      }),
    },
    {
      description: 'Multiple items in source list and no ID specified - selects last created item for copy operation',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        households: [
          inputHousehold('EXISTING_1', {}, 9),
          inputHousehold('EXISTING_2', {}, 2),
          inputHousehold('EXISTING_3', { a: 'b', b: true }, 30),
          inputHousehold('EXISTING_4', {}, 0),
        ],
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      },
      expectedCase: o => ({
        ...o,
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', { a: 'b', b: true }, 30),
        ],
      }),
    },
    {
      description:
        'Multiple items in source list and ID specified that matches ID of item in the source list - selects matched item for copy operation',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        households: [
          inputHousehold('EXISTING_1', {}, 9),
          inputHousehold('EXISTING_2', { a: 'b', b: true }, 2),
          inputHousehold('EXISTING_3', { a: 'c', b: false }, 30),
          inputHousehold('EXISTING_4', {}, 0),
        ],
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      },
      fromId: 'EXISTING_2',
      expectedCase: o => ({
        ...o,
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', { a: 'b', b: true }, 2),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      }),
    },
    {
      description: 'ID specified that does not match any ID of items in the source list - noop',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        households: [
          inputHousehold('EXISTING_1', {}, 9),
          inputHousehold('EXISTING_2', { a: 'b', b: true }, 2),
          inputHousehold('EXISTING_3', { a: 'c', b: false }, 30),
          inputHousehold('EXISTING_4', {}, 0),
        ],
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      },
      fromId: 'NOT_EXISTING_2',
      expectedCase: o => o,
    },
    {
      description: 'No ID specified but source list is empty - noop',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        households: [],
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      },
      expectedCase: o => o,
    },
    {
      description: 'No ID specified but source list does not exist - noop',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      originalCase: {
        ...testCase,
        perpetrators: [
          expectedPerpetrator('EXISTING_1', {}),
          expectedPerpetrator('EXISTING_2', {}),
          expectedPerpetrator('EXISTING_3', {}),
        ],
      },
      expectedCase: o => o,
    },
  ];

  each(testCaseParameters).test(
    '$description',
    ({
      originalCase,
      expectedCase,
      sourceDefinition,
      targetDefinition,
      fromApiOverrides,
      toApiOverrides,
      fromId,
    }: Params) => {
      const result = copyCaseSectionItem({
        definition: {
          ...demoV1,
          caseForms: {
            ...demoV1.caseForms,
            HouseholdForm: sourceDefinition,
            PerpetratorForm: targetDefinition,
          },
        },
        original: originalCase,
        fromApi: { ...householdSectionApi, ...fromApiOverrides },
        toApi: { ...perpetratorSectionApi, ...toApiOverrides },
        fromId,
      });
      expect(result).toStrictEqual(expectedCase(originalCase));
    },
  );
});
