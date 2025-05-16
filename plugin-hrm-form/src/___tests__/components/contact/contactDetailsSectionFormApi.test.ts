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

import { DefinitionVersion, FormInputType, loadDefinition } from 'hrm-form-definitions';

import { mockLocalFetchDefinitions } from '../../mockFetchDefinitions';
import { contactDetailsSectionFormApi } from '../../../components/contact/contactDetailsSectionFormApi';
import { Contact } from '../../../types/types';
import { VALID_EMPTY_CONTACT } from '../../testContacts';

const { mockFetchImplementation, mockReset, buildBaseURL } = mockLocalFetchDefinitions();

let definition: DefinitionVersion;

beforeEach(() => {
  mockReset();
});

beforeAll(async () => {
  const formDefinitionsBaseUrl = buildBaseURL('v1');
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

const emptySearchContact: Contact = {
  ...VALID_EMPTY_CONTACT,
  id: '0',
  channel: 'default',
  rawJson: {
    ...VALID_EMPTY_CONTACT.rawJson,
    contactlessTask: {
      ...VALID_EMPTY_CONTACT.rawJson.contactlessTask,
      channel: 'voice',
    },
  },
};

describe('getFormValues', () => {
  test('CHILD_INFORMATION - unnests name, and creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CHILD_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        rawJson: {
          ...emptySearchContact.rawJson,
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
        rawJson: {
          ...emptySearchContact.rawJson,
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
  test('CASE_INFORMATION - creates undefined props for form items without values', () => {
    expect(
      contactDetailsSectionFormApi.CASE_INFORMATION.getFormValues(definition, {
        ...emptySearchContact,
        rawJson: {
          ...emptySearchContact.rawJson,
          caseInformation: {
            prop1: 'something',
            categories: emptySearchContact.rawJson.caseInformation.categories,
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
