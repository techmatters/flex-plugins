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
  FormInputType,
  loadDefinition,
} from '@tech-matters/hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../../mockFetchDefinitions';
import { copyCaseSectionItem } from '../../../../states/case/sections/copySection';
import { CaseSectionTypeSpecificData } from '../../../../services/caseSectionService';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

beforeEach(() => {
  mockReset();
});

describe('copyCaseSection', () => {
  const toFormDefinition = (names: string[]): FormDefinition =>
    names.map(name => ({ name, label: '', type: FormInputType.Input }));

  let demoV1: DefinitionVersion;
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.demoV1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    demoV1 = await loadDefinition(formDefinitionsBaseUrl);
  });

  type Params = {
    sourceSection: CaseSectionTypeSpecificData;
    expectedCopy: CaseSectionTypeSpecificData;
    sourceDefinition: FormDefinition;
    targetDefinition: FormDefinition;
    fromId?: string;
    description: string;
  };

  const testCaseParameters: Params[] = [
    {
      description:
        'Empty target list, fully matched definitions - new list created with single item fully copied from source',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['a', 'b']),
      sourceSection: { a: 'b', b: true },
      expectedCopy: { a: 'b', b: true },
    },
    {
      description:
        'Empty target list, item only present in source definition - item missing in target definition is not copied',
      sourceDefinition: toFormDefinition(['a', 'b']),
      targetDefinition: toFormDefinition(['b']),
      sourceSection: { a: 'b', b: true },
      expectedCopy: { b: true },
    },
    {
      description:
        'Empty target list, item only present in target definition - item missing in source definition is not copied',
      sourceDefinition: toFormDefinition(['a']),
      targetDefinition: toFormDefinition(['a', 'b']),
      sourceSection: { a: 'b', b: true },
      expectedCopy: { a: 'b' },
    },
    {
      description: 'Empty target list, item present in both definitions but types are mismatched - item not copied',
      sourceDefinition: [...toFormDefinition(['a']), { name: 'b', type: FormInputType.MixedCheckbox, label: '' }],
      targetDefinition: toFormDefinition(['a', 'b']),
      sourceSection: { a: 'b', b: true },
      expectedCopy: { a: 'b' },
    },
    {
      description:
        'Empty target list, list item present in both definitions and a valid option in the target is selected - item copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: FormInputType.Select,
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
          type: FormInputType.Select,
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val2', label: '' },
          ],
        },
      ],
      sourceSection: { a: 'b', b: 'val2' },
      expectedCopy: { a: 'b', b: 'val2' },
    },
    {
      description:
        'Empty target list, list item present in both definitions and an option not defined in the target is selected - item not copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: FormInputType.Select,
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
          type: FormInputType.Select,
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val3', label: '' },
          ],
        },
      ],
      sourceSection: { a: 'b', b: 'val2' },
      expectedCopy: { a: 'b' },
    },
    {
      description:
        'Empty target list, multi-select list item present in both definitions - only selection present in the target list are copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: FormInputType.ListboxMultiselect,
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
          type: FormInputType.ListboxMultiselect,
          label: '',
          options: [
            { value: 'val1', label: '' },
            { value: 'val3', label: '' },
          ],
        },
      ],
      sourceSection: { a: 'b', b: <any>['val1', 'val2'] },
      expectedCopy: { a: 'b', b: <any>['val1'] },
    },
    {
      description:
        'Empty target list, dependent select list item present in both definitions, valid selection and dependent selection for target - item copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: FormInputType.DependentSelect,
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
          type: FormInputType.DependentSelect,
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
      sourceSection: { a: 'dependedVal1', b: 'val2' },
      expectedCopy: { a: 'dependedVal1', b: 'val2' },
    },
    {
      description:
        'Empty target list, dependent select list item present in both definitions, value is valid option but invalid for depended selection on target - item not copied',
      sourceDefinition: [
        ...toFormDefinition(['a']),
        {
          name: 'b',
          type: FormInputType.DependentSelect,
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
          type: FormInputType.DependentSelect,
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
      sourceSection: { a: 'dependedVal1', b: 'val2' },
      expectedCopy: { a: 'dependedVal1' },
    },
  ];

  each(testCaseParameters).test(
    '$description',
    ({ sourceSection, expectedCopy, sourceDefinition, targetDefinition }: Params) => {
      const result = copyCaseSectionItem({
        definition: {
          ...demoV1,
          caseSectionTypes: {
            ...demoV1.caseSectionTypes,
            household: {
              ...demoV1.caseSectionTypes.household,
              form: sourceDefinition,
            },
            perpetrator: {
              ...demoV1.caseSectionTypes.perpetrator,
              form: targetDefinition,
            },
          },
        },
        fromSection: sourceSection,
        fromSectionType: 'household',
        toSectionType: 'perpetrator',
      });
      expect(result).toStrictEqual(expectedCopy);
    },
  );
});
