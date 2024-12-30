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

import {
  populateHrmContactFormFromTask,
  FormItemDefinition,
  FormInputType,
  PrepopulateKeys,
} from '../../../src/hrm/populateHrmContactFormFromTask';
import { BLANK_CONTACT } from './testContacts';
import { RecursivePartial } from '../RecursivePartial';

type FormDefinitionSet = {
  childInformation: FormItemDefinition[];
  callerInformation: FormItemDefinition[];
  caseInformation: FormItemDefinition[];
  prepopulateKeys: PrepopulateKeys;
  helplineInformation: {
    label: string;
    helplines: {
      label: string;
      value: string;
    }[];
  };
};

const BLANK_FORM_DEFINITION: FormDefinitionSet = {
  childInformation: [],
  callerInformation: [],
  caseInformation: [],
  prepopulateKeys: {
    preEngagement: {
      ChildInformationTab: [],
      CallerInformationTab: [],
      CaseInformationTab: [],
    },
    survey: {
      ChildInformationTab: [],
      CallerInformationTab: [],
    },
  },
  helplineInformation: {
    label: '',
    helplines: [{ label: '', value: '' }],
  },
};

const MOCK_FORM_DEFINITION_URL = new URL('https://example.com/formDefinition');

const fetchFormDefinition = async (
  url: string,
  definitionSet: FormDefinitionSet,
): Promise<FormDefinitionSet[keyof FormDefinitionSet]> => {
  if (url.startsWith(MOCK_FORM_DEFINITION_URL.toString())) {
    const formPath = url.substring(MOCK_FORM_DEFINITION_URL.toString().length);
    switch (formPath) {
      case '/tabbedForms/ChildInformationTab.json':
        return definitionSet.childInformation;
      case '/tabbedForms/CallerInformationTab.json':
        return definitionSet.callerInformation;
      case '/tabbedForms/CaseInformationTab.json':
        return definitionSet.caseInformation;
      case '/PrepopulateKeys.json':
        return definitionSet.prepopulateKeys;
      case '/HelplineInformation.json':
        return definitionSet.helplineInformation;
      default:
        throw new Error(`Unrecognised form path: ${formPath}`);
    }
  }
  throw new Error(
    `Invalid URL: ${url}, this test only mocks fetches starting with ${MOCK_FORM_DEFINITION_URL}`,
  );
};

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();

const mockFormDefinitions = (
  definitionSet: Partial<Omit<FormDefinitionSet, 'prepopulateKeys'>> & {
    prepopulateKeys?: RecursivePartial<PrepopulateKeys>;
  },
) => {
  mockFetch.mockImplementation((url: string | URL | Request) =>
    Promise.resolve({
      json: () =>
        Promise.resolve(
          fetchFormDefinition(url.toString(), {
            ...BLANK_FORM_DEFINITION,
            ...definitionSet,
            prepopulateKeys: {
              preEngagement: {
                ChildInformationTab:
                  (definitionSet.prepopulateKeys?.preEngagement
                    ?.ChildInformationTab as string[]) ??
                  BLANK_FORM_DEFINITION.prepopulateKeys.preEngagement.ChildInformationTab,
                CallerInformationTab:
                  (definitionSet.prepopulateKeys?.preEngagement
                    ?.CallerInformationTab as string[]) ??
                  BLANK_FORM_DEFINITION.prepopulateKeys.preEngagement
                    .CallerInformationTab,
                CaseInformationTab:
                  (definitionSet.prepopulateKeys?.preEngagement
                    ?.CaseInformationTab as string[]) ??
                  BLANK_FORM_DEFINITION.prepopulateKeys.preEngagement.CaseInformationTab,
              },
              survey: {
                ChildInformationTab:
                  (definitionSet.prepopulateKeys?.survey
                    ?.ChildInformationTab as string[]) ??
                  BLANK_FORM_DEFINITION.prepopulateKeys.survey.ChildInformationTab,
                CallerInformationTab:
                  (definitionSet.prepopulateKeys?.survey
                    ?.CallerInformationTab as string[]) ??
                  BLANK_FORM_DEFINITION.prepopulateKeys.survey.CallerInformationTab,
              },
            },
          }),
        ),
    } as Response),
  );
};

global.fetch = mockFetch;
describe('populateHrmContactFormFromTask', () => {
  test('preEngagement only, child caller - sets callType as child and childInformation to blanks and pore', async () => {
    const preEngagementData = {
      upsetLevel: '1',
      gender: 'Agender',
      friendlyName: 'Anonymous',
      age: '11',
    };
    const tabFormDefinition: FormItemDefinition[] = [
      {
        name: 'firstName',
        type: FormInputType.Input,
      },
      {
        name: 'age',
        type: FormInputType.Select,
        options: [
          {
            value: '',
          },
          {
            value: '11',
          },
          {
            value: '>12',
          },
          {
            value: 'Unknown',
          },
        ],
      },
      {
        name: 'gender',
        type: FormInputType.ListboxMultiselect,
        options: [
          {
            value: 'Agender',
          },
          {
            value: 'Non-Binary/Genderqueer/Gender fluid',
          },
          {
            value: 'Unknown',
          },
        ],
      },
      {
        name: 'otherGender',
        type: FormInputType.Input,
      },
    ];
    const prepopulateKeys1 = ['age', 'gender'];

    mockFormDefinitions({
      childInformation: tabFormDefinition,
      prepopulateKeys: {
        preEngagement: {
          ChildInformationTab: prepopulateKeys1,
        },
      },
    });

    const populatedContact = await populateHrmContactFormFromTask(
      { preEngagementData },
      BLANK_CONTACT,
      MOCK_FORM_DEFINITION_URL,
    );

    const expectedValues = {
      age: '11',
      gender: 'Agender',
      firstName: '', // firstName is always added whether in the form def or not
      otherGender: '',
    };

    expect(populatedContact.rawJson.childInformation).toEqual(expectedValues);
  });
});
