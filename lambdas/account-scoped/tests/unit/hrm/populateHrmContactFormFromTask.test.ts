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
  HrmContact,
  clearDefinitionCache,
} from '../../../src/hrm/populateHrmContactFormFromTask';
import { BLANK_CONTACT } from './testContacts';
import { RecursivePartial } from '../RecursivePartial';
import each from 'jest-each';
import { callTypes } from '../../../../../hrm-form-definitions';

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

const BASE_PERSON_FORM_DEFINITION: FormItemDefinition[] = [
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
    defaultOption: 'Unknown',
    type: FormInputType.Select,
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

const BASE_FORM_DEFINITION: FormDefinitionSet = {
  childInformation: BASE_PERSON_FORM_DEFINITION,
  callerInformation: BASE_PERSON_FORM_DEFINITION,
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

type FormDefinitionPatch = Partial<Omit<FormDefinitionSet, 'prepopulateKeys'>> & {
  prepopulateKeys?: RecursivePartial<PrepopulateKeys>;
};

const mockFormDefinitions = (definitionSet: FormDefinitionPatch) => {
  mockFetch.mockImplementation((url: string | URL | Request) =>
    Promise.resolve({
      json: () =>
        Promise.resolve(
          fetchFormDefinition(url.toString(), {
            ...BASE_FORM_DEFINITION,
            ...definitionSet,
            prepopulateKeys: {
              preEngagement: {
                ChildInformationTab:
                  (definitionSet.prepopulateKeys?.preEngagement
                    ?.ChildInformationTab as string[]) ??
                  BASE_FORM_DEFINITION.prepopulateKeys.preEngagement.ChildInformationTab,
                CallerInformationTab:
                  (definitionSet.prepopulateKeys?.preEngagement
                    ?.CallerInformationTab as string[]) ??
                  BASE_FORM_DEFINITION.prepopulateKeys.preEngagement.CallerInformationTab,
                CaseInformationTab:
                  (definitionSet.prepopulateKeys?.preEngagement
                    ?.CaseInformationTab as string[]) ??
                  BASE_FORM_DEFINITION.prepopulateKeys.preEngagement.CaseInformationTab,
              },
              survey: {
                ChildInformationTab:
                  (definitionSet.prepopulateKeys?.survey
                    ?.ChildInformationTab as string[]) ??
                  BASE_FORM_DEFINITION.prepopulateKeys.survey.ChildInformationTab,
                CallerInformationTab:
                  (definitionSet.prepopulateKeys?.survey
                    ?.CallerInformationTab as string[]) ??
                  BASE_FORM_DEFINITION.prepopulateKeys.survey.CallerInformationTab,
              },
            },
          }),
        ),
    } as Response),
  );
};

global.fetch = mockFetch;

describe('populateHrmContactFormFromTask', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    clearDefinitionCache();
  });

  type TestParams = {
    description: string;
    preEngagementData?: Record<string, string>;
    memory?: Record<string, string>;
    firstName?: string;
    language?: string;
    formDefinitionSet: FormDefinitionPatch;
    expectedChildInformation?: HrmContact['rawJson']['childInformation'];
    expectedCallerInformation?: HrmContact['rawJson']['callerInformation'];
    expectedCaseInformation?: HrmContact['rawJson']['caseInformation'];
    expectedCallType?: HrmContact['rawJson']['callType'];
  };

  const testCases: TestParams[] = [
    {
      description:
        'nothing set - sets callType as child and childInformation includes preEngagement data specified in prepopulateKeys',
      formDefinitionSet: {
        prepopulateKeys: {
          preEngagement: {
            ChildInformationTab: ['age', 'gender'],
          },
        },
      },
      expectedChildInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallerInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallType: '',
    },
    {
      description:
        'preEngagement only, child caller - sets callType as child and childInformation includes preEngagement data specified in prepopulateKeys',
      preEngagementData: {
        upsetLevel: '1',
        gender: 'Agender',
        friendlyName: 'Anonymous',
        age: '11',
      },
      formDefinitionSet: {
        prepopulateKeys: {
          preEngagement: {
            ChildInformationTab: ['age', 'gender'],
          },
        },
      },
      expectedChildInformation: {
        age: '11',
        gender: 'Agender',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallerInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallType: callTypes.child,
    },
    {
      description:
        'chatbot memory only, child calling about self - sets callType as child and childInformation includes chatbot data specified in prepopulateKeys',
      memory: {
        aboutSelf: 'Yes',
        upsetLevel: '1',
        gender: 'Agender',
        friendlyName: 'Anonymous',
        age: '11',
      },
      formDefinitionSet: {
        prepopulateKeys: {
          survey: {
            ChildInformationTab: ['age', 'gender'],
          },
        },
      },
      expectedChildInformation: {
        age: '11',
        gender: 'Agender',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallerInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallType: callTypes.child,
    },
    {
      description:
        'chatbot memory only, calling about child - sets callType as caller and childInformation includes preEngagement data specified in prepopulateKeys',
      memory: {
        aboutSelf: 'No',
        upsetLevel: '1',
        gender: 'Agender',
        friendlyName: 'Anonymous',
        age: '11',
      },
      formDefinitionSet: {
        prepopulateKeys: {
          survey: {
            CallerInformationTab: ['age', 'gender'],
          },
        },
      },
      expectedChildInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallerInformation: {
        age: '11',
        gender: 'Agender',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallType: callTypes.caller,
    },
    {
      description:
        'chatbot memory and pre-engagement, child calling about self - sets callType as child and childInformation includes both sets of data specified in prepopulateKeys',
      memory: {
        aboutSelf: 'Yes',
        friendlyName: 'Anonymous',
        age: '11',
      },
      preEngagementData: {
        upsetLevel: '1',
        gender: 'Agender',
      },
      formDefinitionSet: {
        prepopulateKeys: {
          survey: {
            ChildInformationTab: ['age'],
          },
          preEngagement: {
            ChildInformationTab: ['gender'],
          },
        },
      },
      expectedChildInformation: {
        age: '11',
        gender: 'Agender',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallerInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallType: callTypes.child,
    },
    {
      description:
        'chatbot memory and pre-engagement, caller calling about child - sets callType as caller and callerInformation includes both sets of data specified in prepopulateKeys',
      memory: {
        aboutSelf: 'No',
        friendlyName: 'Anonymous',
        age: '11',
      },
      preEngagementData: {
        upsetLevel: '1',
        gender: 'Agender',
      },
      formDefinitionSet: {
        prepopulateKeys: {
          survey: {
            CallerInformationTab: ['age'],
          },
          preEngagement: {
            CallerInformationTab: ['gender'],
          },
        },
      },
      expectedChildInformation: {
        age: '',
        gender: 'Unknown',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallerInformation: {
        age: '11',
        gender: 'Agender',
        firstName: '', // firstName is always added whether in the form def or not
        otherGender: '',
      },
      expectedCallType: callTypes.caller,
    },
  ];

  each(testCases).test(
    '$description',
    async ({
      formDefinitionSet,
      preEngagementData,
      memory,
      firstName,
      language,
      expectedChildInformation,
      expectedCallerInformation,
      expectedCallType,
      expectedCaseInformation,
    }: TestParams) => {
      mockFormDefinitions(formDefinitionSet);

      const populatedContact = await populateHrmContactFormFromTask(
        {
          ...(preEngagementData ? { preEngagementData } : {}),
          ...(memory ? { memory } : {}),
          ...(firstName ? { firstName } : {}),
          ...(language ? { language } : {}),
        },
        BLANK_CONTACT,
        MOCK_FORM_DEFINITION_URL,
      );
      if (expectedChildInformation) {
        expect(populatedContact.rawJson.childInformation).toEqual(
          expectedChildInformation,
        );
      }
      if (expectedCallerInformation) {
        expect(populatedContact.rawJson.callerInformation).toEqual(
          expectedCallerInformation,
        );
      }
      if (expectedCaseInformation) {
        expect(populatedContact.rawJson.caseInformation).toEqual(expectedCaseInformation);
      }
      if (expectedCallType) {
        expect(populatedContact.rawJson.callType).toEqual(expectedCallType);
      }
    },
  );
});
