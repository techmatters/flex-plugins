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

import { BLANK_CONTACT } from './testContacts';
import { callTypes, HrmContact } from '@tech-matters/hrm-types';
import each from 'jest-each';
import { BASE_FORM_DEFINITION, MOCK_FORM_DEFINITION_URL } from '../../testHrmValues';
import { populateHrmContactFormFromTaskByMappings } from '../../../src/hrm/populateHrmContactFormFromTaskByMappings';
import { isErr } from '../../../src/Result';
import { AssertionError } from 'node:assert';
import { getDefinitionVersion } from '../../../src/hrm/formDefinitionsCache';
import { RecursivePartial } from '../RecursivePartial';
import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';

jest.mock('../../../src/hrm/formDefinitionsCache', () => ({
  getDefinitionVersion: jest.fn(),
}));

const mockFetch: jest.MockedFunction<typeof fetch> = jest.fn();
const mockGetDefinitionVersion = getDefinitionVersion as jest.MockedFunction<
  typeof getDefinitionVersion
>;

const mockFormDefinitions = (definitionSet: RecursivePartial<any>) => {
  mockGetDefinitionVersion.mockResolvedValue({
    ...BASE_FORM_DEFINITION,
    ...definitionSet,
    tabbedForms: {
      ...BASE_FORM_DEFINITION.tabbedForms,
      ...definitionSet.tabbedForms,
    },
  });
};

global.fetch = mockFetch;

describe('populateHrmContactFormFromTaskByMappings', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });
  type TestParams = {
    description: string;
    preEngagementData?: Record<string, string>;
    memory?: Record<string, string>;
    firstName?: string;
    language?: string;
    formDefinitionSet: RecursivePartial<DefinitionVersion>;
    expectedChildInformation?: HrmContact['rawJson']['childInformation'];
    expectedCallerInformation?: HrmContact['rawJson']['callerInformation'];
    expectedCaseInformation?: HrmContact['rawJson']['caseInformation'];
    expectedCallType?: HrmContact['rawJson']['callType'];
  };

  const commonTest = async ({
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

    const populatedContactResult = await populateHrmContactFormFromTaskByMappings(
      {
        ...(preEngagementData ? { preEngagementData } : {}),
        ...(memory ? { memory } : {}),
        ...(firstName ? { firstName } : {}),
        ...(language ? { language } : {}),
      },
      BLANK_CONTACT,
      MOCK_FORM_DEFINITION_URL,
    );
    if (isErr(populatedContactResult)) {
      throw new AssertionError({ message: populatedContactResult.message });
    }
    const populatedContact = populatedContactResult.data;

    if (expectedChildInformation) {
      expect(populatedContact.rawJson.childInformation).toEqual(expectedChildInformation);
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
  };

  describe('selectTabsFromAboutSelfSurveyQuestion (default form selector)', () => {
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
        expectedCallType: '' as any,
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
          prepopulateMappings: {
            preEngagement: {
              age: [['ChildInformationTab.age']],
              gender: [['ChildInformationTab.gender']],
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
          prepopulateMappings: {
            survey: {
              age: [['ChildInformationTab.age']],
              gender: [['ChildInformationTab.gender']],
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
          prepopulateMappings: {
            survey: {
              age: [['CallerInformationTab.age']],
              gender: [['CallerInformationTab.gender']],
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
          prepopulateMappings: {
            survey: {
              age: [['ChildInformationTab.age']],
            },
            preEngagement: {
              gender: [['ChildInformationTab.gender']],
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
          prepopulateMappings: {
            survey: {
              age: [['CallerInformationTab.age']],
            },
            preEngagement: {
              gender: [['CallerInformationTab.gender']],
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

    each(testCases).test('$description', commonTest);
  });
  describe('staticAvailableContactTabSelector', () => {
    const testCases: TestParams[] = [
      {
        description:
          'nothing set - sets callType as child and childInformation includes preEngagement data specified in prepopulateKeys',
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            preEngagement: {
              age: [['ChildInformationTab.age']],
              gender: [['ChildInformationTab.gender']],
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
        expectedCallType: undefined,
      },
      {
        description:
          'preEngagement only, child caller - still sets callType as child and childInformation includes preEngagement data specified in prepopulateKeys',
        preEngagementData: {
          upsetLevel: '1',
          gender: 'Agender',
          friendlyName: 'Anonymous',
          age: '11',
        },
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.child,
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            preEngagement: {
              age: [['ChildInformationTab.age']],
              gender: [['ChildInformationTab.gender']],
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
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            survey: {
              age: [['ChildInformationTab.age']],
              gender: [['ChildInformationTab.gender']],
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
        expectedCallType: undefined,
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
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            survey: {
              age: [['CallerInformationTab.age']],
              gender: [['CallerInformationTab.gender']],
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
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.child,
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            survey: {
              age: [['ChildInformationTab.age']],
            },
            preEngagement: {
              gender: [['ChildInformationTab.gender']],
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
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            survey: {
              age: [['CallerInformationTab.age']],
            },
            preEngagement: {
              gender: [['CallerInformationTab.gender']],
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
          'chatbot memory, value mapped to a single choice of several forms, and the first form is available - populates first form',
        memory: {
          aboutSelf: 'No',
          friendlyName: 'Anonymous',
          age: '11',
        },
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: [
                  'ChildInformationTab',
                  'CallerInformationTab',
                  'CaseInformationTab',
                ],
              } as any,
            },
            survey: {
              age: [['CallerInformationTab.age', 'ChildInformationTab.age']],
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
          gender: 'Unknown',
          firstName: '', // firstName is always added whether in the form def or not
          otherGender: '',
        },
        expectedCallType: callTypes.caller,
      },
      {
        description:
          'chatbot memory, value mapped to a single choice of several forms, and the first choice form is not available but second choice is - populates second form',
        memory: {
          aboutSelf: 'No',
          friendlyName: 'Anonymous',
          age: '11',
        },
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: ['ChildInformationTab', 'CaseInformationTab'],
              } as any,
            },
            survey: {
              age: [['CallerInformationTab.age', 'ChildInformationTab.age']],
            },
          },
        },
        expectedChildInformation: {
          age: '11',
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
        expectedCallType: callTypes.caller,
      },
      {
        description:
          'chatbot memory, value mapped to a single choice of several forms, and choice form is available- populates nothing',
        memory: {
          aboutSelf: 'No',
          friendlyName: 'Anonymous',
          age: '11',
        },
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: ['CaseInformationTab'],
              } as any,
            },
            survey: {
              age: [['CallerInformationTab.age', 'ChildInformationTab.age']],
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
        expectedCallType: callTypes.caller,
      },
      {
        description:
          'chatbot memory, value mapped to a several choice sets - populates the first available choice for all of them',
        memory: {
          aboutSelf: 'No',
          friendlyName: 'Anonymous',
          age: '11',
          gender: 'Agender',
          flub: 'dub',
        },
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: ['ChildInformationTab', 'CaseInformationTab'],
              } as any,
            },
            survey: {
              age: [['CaseInformationTab.age', 'ChildInformationTab.age']],
              gender: [['CallerInformationTab.gender', 'ChildInformationTab.gender']],
              flub: [['CallerInformationTab.flub']],
            },
          },
        },
        expectedCaseInformation: {
          age: '11',
        },
        expectedChildInformation: {
          age: '',
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
        expectedCallType: callTypes.caller,
      },
      {
        description:
          'chatbot memory and pre-engagement survey, takes pre-engagement in a conflict',
        memory: {
          aboutSelf: 'No',
          friendlyName: 'Anonymous',
          age: '11',
          gender: 'Agender',
          flub: 'dub',
        },
        preEngagementData: {
          age: '15',
        },
        formDefinitionSet: {
          prepopulateMappings: {
            formSelector: {
              selectorType: 'staticSelector',
              parameter: {
                callType: callTypes.caller,
                availableTabs: ['ChildInformationTab', 'CaseInformationTab'],
              } as any,
            },
            survey: {
              age: [['CaseInformationTab.age', 'ChildInformationTab.age']],
              gender: [['CallerInformationTab.gender', 'ChildInformationTab.gender']],
              flub: [['CallerInformationTab.flub']],
            },
            preEngagement: {
              age: [['CaseInformationTab.age', 'ChildInformationTab.age']],
            },
          },
        },
        expectedCaseInformation: {
          age: '15',
        },
        expectedChildInformation: {
          age: '',
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
        expectedCallType: callTypes.caller,
      },
    ];

    each(testCases).test('$description', commonTest);
  });
});
