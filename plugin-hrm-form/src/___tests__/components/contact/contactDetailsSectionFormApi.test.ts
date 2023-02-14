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
  FormInputType,
  loadDefinition,
  useFetchDefinitions,
} from 'hrm-form-definitions';

import {
  ContactDetailsSectionFormApi,
  contactDetailsSectionFormApi,
  ContactFormValues,
  IssueCategorizationSectionFormApi,
} from '../../../components/contact/contactDetailsSectionFormApi';
import { SearchAPIContact } from '../../../types/types';
import details from '../../../components/case/casePrint/styles/details';

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

let definition: DefinitionVersion;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
  await mockFetchImplementation(formDefinitionsBaseUrl);

  const v1Def = await loadDefinition(formDefinitionsBaseUrl);
  definition = {
    ...v1Def,
    tabbedForms: {
      ...v1Def.tabbedForms,
      ChildInformationTab: [
        { name: 'firstName', type: FormInputType.Input, label: '' },
        { name: 'lastName', type: FormInputType.Input, label: '' },
        { name: 'otherProp', type: FormInputType.Input, label: '' },
      ],
      CallerInformationTab: [
        { name: 'firstName', type: FormInputType.Input, label: '' },
        { name: 'lastName', type: FormInputType.Input, label: '' },
        { name: 'prop', type: FormInputType.Input, label: '' },
      ],
      CaseInformationTab: [
        { name: 'prop1', type: FormInputType.Input, label: '' },
        { name: 'prop2', type: FormInputType.Input, label: '' },
      ],
      IssueCategorizationTab: helpline => {
        if (helpline !== 'test helpline') throw Error();
        return {
          category1: {
            color: '',
            subcategories: [
              { label: 'sub1', toolkitUrl: '' },
              { label: 'sub2', toolkitUrl: '' },
              { label: 'sub3', toolkitUrl: '' },
              { label: 'sub4', toolkitUrl: '' },
            ],
          },
          category2: {
            color: '',
            subcategories: [
              { label: 'sub1', toolkitUrl: '' },
              { label: 'sub2', toolkitUrl: '' },
              { label: 'sub3', toolkitUrl: '' },
              { label: 'sub4', toolkitUrl: '' },
            ],
          },
        };
      },
    },
  };
});

const emptySearchContact: SearchAPIContact = {
  contactId: '0',
  overview: {
    helpline: undefined,
    dateTime: undefined,
    name: undefined,
    customerNumber: undefined,
    callType: undefined,
    categories: {},
    counselor: undefined,
    notes: undefined,
    channel: undefined,
    conversationDuration: 0,
    createdBy: undefined,
    taskId: undefined,
  },
  csamReports: [],
  details: {
    childInformation: {},
    callerInformation: {},
    caseInformation: {
      categories: {},
    },
    callType: undefined,
    contactlessTask: { channel: 'voice' },
    conversationMedia: [],
  },
};

describe('getFormValues', () => {
  test('CHILD_INFORMATION - unnests name, and creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CHILD_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        details: {
          ...emptySearchContact.details,
          childInformation: {
            firstName: 'Lorna',
            lastName: 'Ballantyne',
          },
        },
      }),
    ).toStrictEqual({
      childInformation: {
        firstName: 'Lorna',
        lastName: 'Ballantyne',
        otherProp: undefined,
      },
    });
  });
  test('CALLER_INFORMATION - unnests name, and creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CALLER_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        details: {
          ...emptySearchContact.details,
          callerInformation: {
            firstName: 'Lorna',
            lastName: 'Ballantyne',
          },
        },
      }),
    ).toStrictEqual({
      callerInformation: {
        firstName: 'Lorna',
        lastName: 'Ballantyne',
        prop: undefined,
      },
    });
  });
  test('ISSUE_CATEGORIZATION - flattens overview categories into single string array', () => {
    expect(
      contactDetailsSectionFormApi.ISSUE_CATEGORIZATION.getFormValues(definition, {
        ...emptySearchContact,
        overview: {
          ...emptySearchContact.overview,
          categories: {
            category1: ['sub2', 'sub4'],
            category2: ['sub1', 'sub4'],
          },
        },
      }),
    ).toStrictEqual({
      categories: expect.arrayContaining([
        'categories.category1.sub2',
        'categories.category1.sub4',
        'categories.category2.sub1',
        'categories.category2.sub4',
      ]),
    });
  });
  test('CASE_INFORMATION - creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CASE_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        details: {
          ...emptySearchContact.details,
          caseInformation: {
            prop1: 'something',
            categories: emptySearchContact.details.caseInformation.categories,
          },
        },
      }),
    ).toStrictEqual({
      caseInformation: {
        prop1: 'something',
      },
    });
  });
});

describe('formToPayload', () => {
  test('CHILD_INFORMATION - nests name, and wraps in a contact payload structure', () => {
    expect(
      contactDetailsSectionFormApi.CHILD_INFORMATION.formToPayload(definition, {
        childInformation: {
          firstName: 'Lorna',
          otherProp: 'something',
        },
      }),
    ).toStrictEqual({
      rawJson: {
        childInformation: {
          firstName: 'Lorna',
          lastName: undefined,
          otherProp: 'something',
        },
      },
    });
  });

  test('CALLER_INFORMATION - nests name, and wraps in a contact payload structure', () => {
    expect(
      contactDetailsSectionFormApi.CALLER_INFORMATION.formToPayload(definition, {
        callerInformation: {
          firstName: 'Lorna',
          prop: 'something',
        },
      }),
    ).toStrictEqual({
      rawJson: {
        callerInformation: {
          firstName: 'Lorna',
          lastName: undefined,
          prop: 'something',
        },
      },
    });
  });
  test('ISSUE_CATEGORIZATION - builds map of boolean maps from flattened category paths', () => {
    expect(
      contactDetailsSectionFormApi.ISSUE_CATEGORIZATION.formToPayload(
        definition,
        {
          categories: [
            'categories.category1.sub2',
            'categories.category1.sub4',
            'categories.category2.sub1',
            'categories.category2.sub4',
          ],
        },
        'test helpline',
      ),
    ).toStrictEqual({
      rawJson: {
        caseInformation: {
          categories: {
            category1: { sub1: false, sub2: true, sub3: false, sub4: true },
            category2: { sub1: true, sub2: false, sub3: false, sub4: true },
          },
        },
      },
    });
  });
  test('CASE_INFORMATION - creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CASE_INFORMATION.formToPayload(definition, {
        caseInformation: {
          prop1: 'yerp',
        },
      }),
    ).toStrictEqual({
      rawJson: {
        caseInformation: {
          prop1: 'yerp',
          prop2: undefined,
        },
      },
    });
  });
});
