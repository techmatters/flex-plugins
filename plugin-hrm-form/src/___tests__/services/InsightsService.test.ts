/* eslint-disable sonarjs/no-identical-functions */
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

/* eslint-disable camelcase */
// import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { DefinitionVersion, FieldType, InsightsObject, callTypes } from 'hrm-form-definitions';
import each from 'jest-each';
import { merge } from 'lodash';

import '../mockGetConfig';
import { processHelplineConfig, buildInsightsData } from '../../services/InsightsService';
import * as hrmConfig from '../../hrmConfig';
import { channelTypes } from '../../states/DomainConstants';
import { getDateTime } from '../../utils/helpers';

jest.spyOn(console, 'error').mockImplementation();

const getDefinitionVersionsSpy = jest.spyOn(hrmConfig, 'getDefinitionVersions').mockImplementation(() => {
  throw new Error('Mock this :)');
});

const contactId = '111';
const caseId = 999;
const createdAt = new Date().toISOString();
const updatedAt = new Date().toISOString();
const date = '2023-09-15';
const time = '18:48:40';

const oneToOneConfigSpec: DefinitionVersion['insights']['oneToOneConfigSpec'] = {
  contactForm: {
    childInformation: [
      {
        name: 'toCustomers',
        insights: [InsightsObject.Customers, 'customer_attribute_1'],
      },
      {
        name: 'toConversations',
        insights: [InsightsObject.Conversations, 'conversation_measure_1'],
      },
    ],
    callerInformation: [
      {
        name: 'toCustomers',
        insights: [InsightsObject.Customers, 'customer_attribute_2'],
      },
      {
        name: 'toConversations',
        insights: [InsightsObject.Conversations, 'conversation_measure_2'],
      },
    ],
    caseInformation: [
      {
        name: 'toCustomers',
        insights: [InsightsObject.Customers, 'customer_attribute_3'],
      },
      {
        name: 'toConversations',
        insights: [InsightsObject.Conversations, 'conversation_measure_3'],
      },
    ],
  },
  caseForm: {
    topLevel: [
      {
        name: 'id',
        insights: [InsightsObject.Conversations, 'case'],
      },
    ],
  },
};

// const oneToManyConfigSpecs: DefinitionVersion['insights']['oneToManyConfigSpecs'] = [
//   { attributeName: 'customer_attribute_7', insightsObject: InsightsObject.Customers, paths: [''] },
// ];

const taskWithAttributes = (attributes: {}) =>
  ({
    sid: 'WR123',
    taskSid: 'WT123',
    attributes,
  } as any);

const contactFormWithCallType = (callType: string) => ({
  childInformation: {
    language: 'language',
    age: 'child-age',
    gender: 'child-gender',
    toCustomers: 'child-toCustomers',
    toConversations: 'child-toConversations',
  },
  callerInformation: {
    age: 'caller-age',
    gender: 'caller-gender',
    toCustomers: 'caller-toCustomers',
    toConversations: 'caller-toConversations',
  },
  caseInformation: {
    toCustomers: 'caseInfo-toCustomers',
    toConversations: 'caseInfo-toConversations',
  },
  categories: ['categories.cat1.subcat1', 'categories.catX.subcatY'],
  callType,
  helpline: 'helpline',
  contactlessTask: {
    channel: channelTypes.web,
    date,
    time,
  },
  csamReports: [],
  metadata: {} as any,
  draft: {} as any,
  isCallTypeCaller: false,
});

const caseForm = {
  accountSid: 'AC123',
  id: caseId,
  info: {
    counsellorNotes: [],
    households: [],
    referrals: [],
    perpetrators: [],
  },
  status: 'open',
  helpline: 'helpline',
  twilioWorkerId: 'twilioWorkerId',
  categories: [],
  createdAt,
  updatedAt,
  connectedContacts: [],
};

const taskAttributes = { previousAttribute: 123, channelType: channelTypes.web };
const offlineContactTaskAttributes = { ...taskAttributes, isContactlessTask: true };

describe('buildInsightsData', () => {
  describe('with non-data callType', () => {
    describe('when no custom mappings are present', () => {
      each([
        { attributes: taskAttributes, description: 'for regular contact, attributes contain only "coreAttributes"' },
        {
          attributes: offlineContactTaskAttributes,
          description: 'for offline contact, attributes contain only "coreAttributes" and "contactlessTaskUpdates"',
        },
      ]).test('$description', async ({ attributes }) => {
        getDefinitionVersionsSpy.mockImplementationOnce(
          () =>
            ({
              currentDefinitionVersion: {
                insights: { oneToOneConfigSpec: {}, oneToManyConfigSpecs: [] },
              },
            } as any),
        );

        const result = buildInsightsData(
          taskWithAttributes(attributes),
          contactFormWithCallType('non-data'),
          caseForm,
          { channel: channelTypes.web, id: contactId } as any,
        );

        const expectedAttributes = {
          ...attributes,
          conversations: {
            conversation_attribute_5: null,
            communication_channel: 'Web',
            conversation_attribute_2: 'non-data',
            conversation_attribute_3: 'caller-age',
            conversation_attribute_4: 'caller-gender',
            conversation_attribute_8: 'helpline',
            language: 'language',
            ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
          },
          customers: { year_of_birth: 'child-age', gender: 'child-gender' },
        };

        expect(result).toStrictEqual(expectedAttributes);
      });
    });

    describe('when custom mappings are present', () => {
      each([
        { attributes: taskAttributes, description: 'for regular contact ' },
        {
          attributes: offlineContactTaskAttributes,
          description: 'for offline contact',
        },
      ]).test('oneToOneConfigSpec are ignored $description', async ({ attributes }) => {
        getDefinitionVersionsSpy.mockImplementationOnce(
          () =>
            ({
              currentDefinitionVersion: {
                insights: { oneToOneConfigSpec, oneToManyConfigSpecs: [] },
              },
            } as any),
        );

        const result = buildInsightsData(
          taskWithAttributes(attributes),
          contactFormWithCallType('non-data'),
          caseForm,
          { channel: channelTypes.web, id: contactId } as any,
        );

        const expectedAttributes = {
          ...attributes,
          conversations: {
            conversation_attribute_5: null,
            communication_channel: 'Web',
            conversation_attribute_2: 'non-data',
            conversation_attribute_3: 'caller-age',
            conversation_attribute_4: 'caller-gender',
            conversation_attribute_8: 'helpline',
            language: 'language',
            ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
          },
          customers: { year_of_birth: 'child-age', gender: 'child-gender' },
        };

        expect(result).toStrictEqual(expectedAttributes);
      });

      each([
        {
          attributes: taskAttributes,
          saveForNonDataContacts: false,
          description: 'for regular contact, oneToManyConfigSpecs are ignored',
        },
        {
          attributes: offlineContactTaskAttributes,
          saveForNonDataContacts: false,
          description: 'for offline contact, oneToManyConfigSpecs are ignored',
        },
        {
          attributes: taskAttributes,
          saveForNonDataContacts: true,
          description: 'for regular contact, oneToManyConfigSpecs are processed',
        },
        {
          attributes: offlineContactTaskAttributes,
          saveForNonDataContacts: true,
          description: 'for offline contact, oneToManyConfigSpecs are processed',
        },
      ]).test(
        '$description if saveForNonDataContacts $saveForNonDataContacts',
        async ({ attributes, saveForNonDataContacts }) => {
          getDefinitionVersionsSpy.mockImplementationOnce(
            () =>
              ({
                currentDefinitionVersion: {
                  insights: {
                    oneToOneConfigSpec: {},
                    oneToManyConfigSpecs: [
                      {
                        attributeName: 'customer_attribute_7',
                        insightsObject: InsightsObject.Customers,
                        paths: ['savedContact.id', 'contactForm.helpline'],
                        ...(saveForNonDataContacts && { saveForNonDataContacts }),
                      },
                      {
                        attributeName: 'conversation_measure_7',
                        insightsObject: InsightsObject.Conversations,
                        paths: ['savedContact.id', 'contactForm.helpline'],
                        ...(saveForNonDataContacts && { saveForNonDataContacts }),
                      },
                    ],
                  },
                },
              } as any),
          );

          const result = buildInsightsData(
            taskWithAttributes(attributes),
            contactFormWithCallType('non-data'),
            caseForm,
            { channel: channelTypes.web, id: contactId } as any,
          );

          const expectedAttributes = {
            ...attributes,
            conversations: {
              conversation_attribute_5: null,
              communication_channel: 'Web',
              conversation_attribute_2: 'non-data',
              conversation_attribute_3: 'caller-age',
              conversation_attribute_4: 'caller-gender',
              conversation_attribute_8: 'helpline',
              language: 'language',
              ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
              ...(saveForNonDataContacts && { conversation_measure_7: `${contactId};helpline` }),
            },
            customers: {
              year_of_birth: 'child-age',
              gender: 'child-gender',
              ...(saveForNonDataContacts && { customer_attribute_7: `${contactId};helpline` }),
            },
          };

          expect(result).toStrictEqual(expectedAttributes);
        },
      );
    });
  });

  describe('with data callType', () => {
    describe('when no custom mappings are present', () => {
      each([
        { attributes: taskAttributes, description: 'for regular contact, attributes contain only "coreAttributes"' },
        {
          attributes: offlineContactTaskAttributes,
          description: 'for offline contact, attributes contain only "coreAttributes" and "contactlessTaskUpdates"',
        },
      ]).test('$description', async ({ attributes }) => {
        getDefinitionVersionsSpy.mockImplementationOnce(
          () =>
            ({
              currentDefinitionVersion: {
                insights: { oneToOneConfigSpec: {}, oneToManyConfigSpecs: [] },
              },
            } as any),
        );

        const result = buildInsightsData(
          taskWithAttributes(attributes),
          contactFormWithCallType(callTypes.child),
          caseForm,
          { channel: channelTypes.web, id: contactId } as any,
        );

        const expectedAttributes = {
          ...attributes,
          conversations: {
            conversation_attribute_5: null,
            communication_channel: 'Web',
            conversation_attribute_1: 'subcat1;subcatY',
            conversation_attribute_2: callTypes.child,
            conversation_attribute_3: 'caller-age',
            conversation_attribute_4: 'caller-gender',
            conversation_attribute_8: 'helpline',
            language: 'language',
            ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
          },
          customers: { year_of_birth: 'child-age', gender: 'child-gender' },
        };

        expect(result).toStrictEqual(expectedAttributes);
      });
    });

    describe('when custom mappings are present', () => {
      each(
        [
          { attributes: taskAttributes, description: 'for regular contact' },
          {
            attributes: offlineContactTaskAttributes,
            description: 'for offline contact',
          },
        ].flatMap(testCase => [
          { ...testCase, callType: callTypes.child },
          { ...testCase, callType: callTypes.caller },
        ]),
      ).test(
        'oneToOneConfigSpec are processed $description with callType $callType',
        async ({ attributes, callType }) => {
          getDefinitionVersionsSpy.mockImplementationOnce(
            () =>
              ({
                currentDefinitionVersion: {
                  insights: { oneToOneConfigSpec, oneToManyConfigSpecs: [] },
                },
              } as any),
          );

          const result = buildInsightsData(
            taskWithAttributes(attributes),
            contactFormWithCallType(callType),
            caseForm,
            { channel: channelTypes.web, id: contactId } as any,
          );

          const expectedAttributes = merge(
            {
              ...attributes,
              conversations: {
                conversation_attribute_5: null,
                communication_channel: 'Web',
                conversation_attribute_1: 'subcat1;subcatY',
                conversation_attribute_2: callType,
                conversation_attribute_3: 'caller-age',
                conversation_attribute_4: 'caller-gender',
                conversation_attribute_8: 'helpline',
                language: 'language',
                ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
                case: caseId.toString(),
                conversation_measure_1: 'child-toConversations',
                conversation_measure_3: 'caseInfo-toConversations',
              },
              customers: {
                year_of_birth: 'child-age',
                gender: 'child-gender',
                customer_attribute_1: 'child-toCustomers',
                customer_attribute_3: 'caseInfo-toCustomers',
              },
            },
            // This should only be processed if callTypes is "caller"
            callType === callTypes.caller
              ? {
                  conversations: {
                    conversation_measure_2: 'caller-toConversations',
                  },
                  customers: { customer_attribute_2: 'caller-toCustomers' },
                }
              : {},
          );

          expect(result).toStrictEqual(expectedAttributes);
        },
      );

      each(
        [
          { attributes: taskAttributes, description: 'for regular contact' },
          {
            attributes: offlineContactTaskAttributes,
            description: 'for offline contact',
          },
        ].flatMap(testCase => [
          { ...testCase, callType: callTypes.child },
          { ...testCase, callType: callTypes.caller },
        ]),
      ).test(
        'oneToManyConfigSpec are processed $description with callType $callType',
        async ({ attributes, callType }) => {
          getDefinitionVersionsSpy.mockImplementationOnce(
            () =>
              ({
                currentDefinitionVersion: {
                  insights: {
                    oneToOneConfigSpec: {},
                    oneToManyConfigSpecs: [
                      {
                        attributeName: 'customer_attribute_7',
                        insightsObject: InsightsObject.Customers,
                        paths: ['savedContact.id', 'contactForm.helpline', 'caseForm.id'],
                      },
                      {
                        attributeName: 'conversation_measure_7',
                        insightsObject: InsightsObject.Conversations,
                        paths: ['savedContact.id', 'contactForm.helpline', 'caseForm.id'],
                      },
                      {
                        attributeName: 'customer_attribute_1',
                        insightsObject: InsightsObject.Customers,
                        paths: ['contactForm.childInformation.toCustomers'],
                      },
                      {
                        attributeName: 'conversation_measure_1',
                        insightsObject: InsightsObject.Conversations,
                        paths: ['contactForm.childInformation.toConversations'],
                      },

                      {
                        attributeName: 'customer_attribute_2',
                        insightsObject: InsightsObject.Customers,
                        paths: ['contactForm.callerInformation.toCustomers'],
                      },
                      {
                        attributeName: 'conversation_measure_2',
                        insightsObject: InsightsObject.Conversations,
                        paths: ['contactForm.callerInformation.toConversations'],
                      },

                      {
                        attributeName: 'customer_attribute_3',
                        insightsObject: InsightsObject.Customers,
                        paths: ['contactForm.caseInformation.toCustomers'],
                      },
                      {
                        attributeName: 'conversation_measure_3',
                        insightsObject: InsightsObject.Conversations,
                        paths: ['contactForm.caseInformation.toConversations'],
                      },
                    ],
                  },
                },
              } as any),
          );

          const result = buildInsightsData(
            taskWithAttributes(attributes),
            contactFormWithCallType(callType),
            caseForm,
            { channel: channelTypes.web, id: contactId } as any,
          );

          const expectedAttributes = {
            ...attributes,
            conversations: {
              conversation_attribute_5: null,
              communication_channel: 'Web',
              conversation_attribute_1: 'subcat1;subcatY',
              conversation_attribute_2: callType,
              conversation_attribute_3: 'caller-age',
              conversation_attribute_4: 'caller-gender',
              conversation_attribute_8: 'helpline',
              language: 'language',
              ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
              conversation_measure_1: 'child-toConversations',
              conversation_measure_2: 'caller-toConversations',
              conversation_measure_3: 'caseInfo-toConversations',
              conversation_measure_7: `${contactId};helpline;${caseId}`,
            },
            customers: {
              year_of_birth: 'child-age',
              gender: 'child-gender',
              customer_attribute_1: 'child-toCustomers',
              customer_attribute_2: 'caller-toCustomers',
              customer_attribute_3: 'caseInfo-toCustomers',
              customer_attribute_7: `${contactId};helpline;${caseId}`,
            },
          };

          expect(result).toStrictEqual(expectedAttributes);
        },
      );

      each(
        [
          { attributes: taskAttributes, description: 'for regular contact' },
          {
            attributes: offlineContactTaskAttributes,
            description: 'for offline contact',
          },
        ].flatMap(testCase => [
          { ...testCase, callType: callTypes.child },
          { ...testCase, callType: callTypes.caller },
        ]),
      ).test(
        'oneToManyConfigSpec overrides oneToOneConfigSpec $description with callType $callType',
        async ({ attributes, callType }) => {
          getDefinitionVersionsSpy.mockImplementationOnce(
            () =>
              ({
                currentDefinitionVersion: {
                  insights: {
                    oneToOneConfigSpec: {
                      contactForm: {
                        childInformation: [
                          {
                            name: 'toCustomers',
                            insights: [InsightsObject.Customers, 'customer_attribute_7'],
                          },
                          {
                            name: 'toConversations',
                            insights: [InsightsObject.Conversations, 'conversation_measure_7'],
                          },
                        ],
                      },
                    },
                    oneToManyConfigSpecs: [
                      {
                        attributeName: 'customer_attribute_7',
                        insightsObject: InsightsObject.Customers,
                        paths: ['savedContact.id', 'contactForm.helpline', 'caseForm.id'],
                      },
                      {
                        attributeName: 'conversation_measure_7',
                        insightsObject: InsightsObject.Conversations,
                        paths: ['savedContact.id', 'contactForm.helpline', 'caseForm.id'],
                      },
                    ],
                  },
                },
              } as any),
          );

          const result = buildInsightsData(
            taskWithAttributes(attributes),
            contactFormWithCallType(callType),
            caseForm,
            { channel: channelTypes.web, id: contactId } as any,
          );

          const expectedAttributes = {
            ...attributes,
            conversations: {
              conversation_attribute_5: null,
              communication_channel: 'Web',
              conversation_attribute_1: 'subcat1;subcatY',
              conversation_attribute_2: callType,
              conversation_attribute_3: 'caller-age',
              conversation_attribute_4: 'caller-gender',
              conversation_attribute_8: 'helpline',
              language: 'language',
              ...(attributes.isContactlessTask && { date: getDateTime({ date, time }) }),
              conversation_measure_7: `${contactId};helpline;${caseId}`,
            },
            customers: {
              year_of_birth: 'child-age',
              gender: 'child-gender',
              customer_attribute_7: `${contactId};helpline;${caseId}`,
            },
          };

          expect(result).toStrictEqual(expectedAttributes);
        },
      );
    });
  });
});

describe('processHelplineConfig (legacy tests)', () => {
  test('processHelplineConfig works for basic cases', async () => {
    const helplineConfig = {
      contactForm: {
        childInformation: [
          {
            name: 'village',
            insights: ['customers', 'city'],
          },
          {
            name: 'language',
            insights: ['conversations', 'language'],
          },
        ],
      },
    };
    const contactForm = {
      callType: 'Child calling about self',
      childInformation: {
        village: 'Somewhere',
        language: 'Martian',
        age: '13-15',
        gender: 'Boy',
      },
      caseInformation: {},
      categories: [
        'categories.Missing children.Unspecified/Other',
        'categories.Violence.Bullying',
        'categories.Mental Health.Addictive behaviours and substance use',
      ],
    };
    const caseForm = {};
    const expected = {
      conversations: {
        language: 'Martian',
      },
      customers: {
        city: 'Somewhere',
      },
    };
    // @ts-ignore
    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });
  test('processHelplineConfig for three-way checkboxes', async () => {
    const helplineConfig = {
      contactForm: {
        childInformation: [
          {
            name: 'hivPositive',
            insights: ['customers', 'category'],
            type: 'mixed-checkbox',
          },
        ],
      },
    };
    const contactForm = {
      callType: 'Child calling about self',
      childInformation: {
        hivPositive: 'mixed',
      },
    };
    const caseForm = {};
    const expected = {
      conversations: {},
      customers: {
        category: null,
      },
    };
    // @ts-ignore
    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });
  test('processHelplineConfig for case data', () => {
    const helplineConfig = {
      contactForm: {},
      caseForm: {
        topLevel: [
          {
            name: 'id',
            insights: ['conversations', 'case'],
          },
        ],
        perpetrator: [
          {
            name: 'relationshipToChild',
            insights: ['customers', 'organization'],
          },
          {
            name: 'gender',
            insights: ['conversations', 'followed_by'],
          },
          {
            name: 'age',
            insights: ['conversations', 'preceded_by'],
          },
        ],
        incident: [
          {
            name: 'duration',
            insights: ['conversations', 'in_business_hours'],
          },
          {
            name: 'location',
            insights: ['customers', 'market_segment'],
          },
        ],
        referral: [
          {
            name: 'referredTo',
            insights: ['customers', 'customer_manager'],
          },
        ],
      },
    };
    const contactForm = {};
    const caseForm = {
      id: 102,
      status: 'open',
      helpline: '',
      twilioWorkerId: 'worker',
      info: {
        summary: 'case summary',
        notes: ['my note'],
        perpetrators: [
          {
            perpetrator: {
              name: {
                firstName: 'first',
                lastName: 'last',
              },
              relationshipToChild: 'Grandparent',
              gender: 'Boy',
              age: '>25',
              language: 'Bemba',
              nationality: 'Zambian',
              ethnicity: 'Bembese',
              location: {
                streetAddress: '',
                city: '',
                stateOrCounty: '',
                postalCode: '',
                phone1: '',
                phone2: '',
              },
            },
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        households: [
          {
            household: {
              name: {
                firstName: 'first',
                lastName: 'last',
              },
              relationshipToChild: 'Mother',
              gender: 'Girl',
              age: '>25',
              language: 'Bemba',
              nationality: 'Zambian',
              ethnicity: 'Bembese',
              location: {
                streetAddress: '',
                city: '',
                stateOrCounty: '',
                postalCode: '',
                phone1: '',
                phone2: '',
              },
            },
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        referrals: [
          {
            date: new Date(),
            referredTo: 'Referral Agency 1',
            comments: 'A referral',
          },
          {
            date: new Date(),
            referredTo: 'Referral Agency 2',
            comments: 'Another referral',
          },
        ],
        incidents: [
          {
            duration: '2',
            location: 'At home',
          },
        ],
        followUpDate: '2021-01-30',
      },
      createdAt: '',
      updatdAt: '',
      connectedContacts: [],
    };
    const expected = {
      conversations: {
        case: '102',
        followed_by: 'Boy',
        preceded_by: '>25',
        in_business_hours: '2',
      },
      customers: {
        organization: 'Grandparent',
        market_segment: 'At home',
        customer_manager: 'Referral Agency 1',
      },
    };
    // @ts-ignore
    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });
  test('processHelplineConfig does not add caller fields for child call types', async () => {
    const helplineConfig = {
      contactForm: {
        callerInformation: [
          {
            name: 'gender',
            insights: ['conversations', 'conversation_attribute_4'],
          },
        ],
        childInformation: [
          {
            name: 'language',
            insights: ['conversations', 'language'],
          },
        ],
      },
    };
    const contactForm = {
      callType: 'Child calling about self',
      callerInformation: {
        gender: 'Boy',
      },
      childInformation: {
        language: 'English',
      },
    };
    const caseForm = {};
    const expected = {
      conversations: {
        language: 'English',
      },
      customers: {},
    };
    // @ts-ignore
    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });
});
