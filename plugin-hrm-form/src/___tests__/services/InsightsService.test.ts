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
import {
  DefinitionVersionId,
  InsightsFieldSpec,
  loadDefinition,
  OneToOneConfigSpec,
  useFetchDefinitions,
} from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../mockGetConfig';
import {
  baseUpdates,
  contactlessTaskUpdates,
  processHelplineConfig,
  mergeAttributes,
  buildInsightsData,
} from '../../services/InsightsService';
import { getDefinitionVersions } from '../../hrmConfig';
import { channelTypes } from '../../states/DomainConstants';
import { Case, ContactRawJson, CustomITask, HrmServiceContact } from '../../types/types';
import { VALID_EMPTY_CONTACT } from '../testContacts';
import { ExternalRecordingInfo } from '../../services/getExternalRecordingInfo';

jest.spyOn(console, 'error').mockImplementation();

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();
type InsightsObject = InsightsFieldSpec['insights'][0];

describe('InsightsService', () => {
  const helpline = 'helpline';
  let v1;
  /*
   * This helper matches the way attributes were updated previous the changes Gian introduced in https://github.com/tech-matters/flex-plugins/pull/364/commits/9d09afec0db49716ef0b7518aaa5f7bc6159db64
   * Used to test that the attributes matches with what we expected before
   */
  const zambiaUpdates = (attributes, { rawJson }: HrmServiceContact, caseForm: Case) => {
    const attsToReturn = processHelplineConfig(rawJson, caseForm, v1.insights.oneToOneConfigSpec);

    attsToReturn.customers.area = [rawJson.childInformation.province, rawJson.childInformation.district].join(';');

    return attsToReturn;
  };

  const expectWithV1Zambia = (attributes, contact: HrmServiceContact, caseForm: Case) =>
    [baseUpdates, contactlessTaskUpdates, zambiaUpdates]
      .map(f => f(attributes, contact, caseForm, contact))
      .reduce((acc, curr) => mergeAttributes(acc, curr), { ...attributes });

  beforeEach(() => {
    mockReset();
  });

  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    v1 = await loadDefinition(formDefinitionsBaseUrl);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, v1);
  });

  test('Insights Data for non-data callType', async () => {
    const previousAttributes = {
      taskSid: 'task-sid',
      channelType: 'sms',
      conversations: {
        content: 'content',
      },
      helpline,
    } as CustomITask['attributes'];

    const twilioTask = {
      attributes: previousAttributes,
    } as CustomITask;

    const contact: HrmServiceContact = {
      ...VALID_EMPTY_CONTACT,
      helpline,
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType: 'Abusive',
        callerInformation: {
          age: '26',
          gender: 'Girl',
        },
        childInformation: {
          age: '18',
          gender: 'Boy',
          language: 'language',
        },
      },
    };

    const result = buildInsightsData(twilioTask, contact, {} as Case, contact);
    const { rawJson: form } = contact;
    const expectedNewAttributes = {
      ...previousAttributes,
      conversations: {
        content: 'content',
        conversation_attribute_2: 'Abusive',
        conversation_attribute_5: null,
        communication_channel: 'SMS',
        conversation_attribute_3: form.callerInformation.age,
        conversation_attribute_4: form.callerInformation.gender,
        conversation_attribute_8: helpline,
        language: form.childInformation.language,
      },
      customers: {
        year_of_birth: form.childInformation.age,
        gender: form.childInformation.gender,
      },
    };

    expect(result).toEqual(expectedNewAttributes);
  });

  test('Insights Data for non-data callType (test that fields are sanitized)', async () => {
    const previousAttributes = {
      taskSid: 'task-sid',
      channelType: 'sms',
      conversations: {
        content: 'content',
      },
      helpline,
      helplineToSave: 'helpline',
    } as CustomITask['attributes'];

    const twilioTask = {
      attributes: previousAttributes,
    } as CustomITask;

    const contactForm: HrmServiceContact = {
      ...VALID_EMPTY_CONTACT,
      helpline,
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType: 'Abusive',
        callerInformation: {
          age: '',
          gender: '',
        },
        childInformation: {
          age: '',
          gender: '',
          language: '',
        },
      },
    };

    const result = buildInsightsData(twilioTask, contactForm, {} as Case, contactForm);

    const expectedNewAttributes = {
      ...previousAttributes,
      conversations: {
        content: 'content',
        conversation_attribute_2: 'Abusive',
        conversation_attribute_5: null,
        communication_channel: 'SMS',
        conversation_attribute_3: null,
        conversation_attribute_4: null,
        conversation_attribute_8: helpline,
        language: null,
      },
      customers: {
        year_of_birth: null,
        gender: null,
      },
    };

    expect(result).toEqual(expectedNewAttributes);
  });

  test('Insights Data for data callType', async () => {
    const previousAttributes = {
      taskSid: 'task-sid',
      channelType: 'voice',
      conversations: {
        content: 'content',
      },
      customers: {
        name: 'John Doe',
      },
    } as CustomITask['attributes'];

    const twilioTask = {
      attributes: previousAttributes,
    } as CustomITask;

    const contact: HrmServiceContact = {
      ...VALID_EMPTY_CONTACT,
      helpline: 'helpline',
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType: 'Child calling about self',
        childInformation: {
          age: '13-15',
          gender: 'Boy',
          language: 'language',
        },
        callerInformation: {
          age: '26',
          gender: 'Girl',
        },
        caseInformation: {},
        categories: {
          'Missing children': ['Unspecified/Other'],
          Violence: ['Bullying'],
          'Mental Health': ['Addictive behaviours and substance use'],
        },
      },
    };

    const caseForm = {
      id: 123,
    } as Case;

    const expectedNewAttributes = expectWithV1Zambia(twilioTask.attributes, contact, caseForm);

    const result = buildInsightsData(twilioTask, contact, caseForm, contact);

    /*
     * const expectedNewAttributes = {
     *   taskSid: 'task-sid',
     *   channelType: 'voice',
     *   conversations: {
     *     content: 'content',
     *     conversation_attribute_1: 'Unspecified/Other - Missing children;Bullying;Addictive behaviours and substance use',
     *     conversation_attribute_2: 'Child calling about self',
     *     conversation_attribute_5: null,
     *     communication_channel: 'Call',
     *   },
     *   customers: {
     *     name: 'John Doe',
     *   },
     * };
     */

    expect(result).toEqual(expectedNewAttributes);
  });

  test('Handles contactless tasks', async () => {
    const previousAttributes = {
      taskSid: 'task-sid',
      isContactlessTask: true,
      channelType: 'default',
    } as CustomITask['attributes'];

    const twilioTask = {
      attributes: previousAttributes,
    } as CustomITask;

    const date = '2020-12-30';
    const time = '14:50';
    const contactForm: HrmServiceContact = {
      ...VALID_EMPTY_CONTACT,
      helpline,
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType: 'Child calling about self',
        contactlessTask: {
          channel: 'sms',
          date,
          time,
          createdOnBehalfOf: undefined,
        },
        childInformation: {
          age: '3',
          gender: 'Unknown',
          language: 'language',
        },
        callerInformation: {
          age: '26',
          gender: 'Girl',
        },
        caseInformation: {},
        categories: {
          Violence: ['Unspecified/Other'],
        },
      },
    };

    const caseForm = {
      id: 123,
    } as Case;

    const expectedNewAttributes = expectWithV1Zambia(twilioTask.attributes, contactForm, caseForm);

    const result = buildInsightsData(twilioTask, contactForm, caseForm, contactForm);

    /*
     * const expectedNewAttributes = {
     *   taskSid: 'task-sid',
     *   isContactlessTask: true,
     *   channelType: 'default',
     *   conversations: {
     *     conversation_attribute_1: 'Unspecified/Other - Violence',
     *     conversation_attribute_2: 'Child calling about self',
     *     conversation_attribute_5: null,
     *     communication_channel: 'SMS',
     *     date: getDateTime({ date, time }),
     *   },
     *   customers: {},
     * };
     */

    expect(result).toEqual(expectedNewAttributes);
  });

  test('processHelplineConfig works for basic cases', async () => {
    const helplineConfig: OneToOneConfigSpec = {
      contactForm: {
        childInformation: [
          {
            name: 'village',
            insights: ['customers' as InsightsObject, 'city'],
          },
          {
            name: 'language',
            insights: ['conversations' as InsightsObject, 'language'],
          },
        ],
      },
    };

    const contactForm: ContactRawJson = {
      ...VALID_EMPTY_CONTACT.rawJson,
      callType: 'Child calling about self',

      childInformation: {
        village: 'Somewhere',
        language: 'Martian',
        age: '13-15',
        gender: 'Boy',
      },
      caseInformation: {},
      categories: {
        'Missing children': ['Unspecified/Other'],
        Violence: ['Bullying'],
        'Mental Health': ['Addictive behaviours and substance use'],
      },
    };

    const caseForm = {} as Case;

    const expected = {
      conversations: {
        language: 'Martian',
      },
      customers: {
        city: 'Somewhere',
      },
    };

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
    } as OneToOneConfigSpec;

    const contactForm: ContactRawJson = {
      ...VALID_EMPTY_CONTACT.rawJson,
      callType: 'Child calling about self',

      childInformation: {
        hivPositive: 'mixed',
      },
    };

    const caseForm = {} as Case;

    const expected = {
      conversations: {},
      customers: {
        category: null,
      },
    };

    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);

    contactForm.childInformation.hivPositive = true;
    expected.customers.category = 1;
    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);

    contactForm.childInformation.hivPositive = false;
    expected.customers.category = 0;
    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });

  test('processHelplineConfig for case data', () => {
    const helplineConfig: OneToOneConfigSpec = {
      contactForm: {},
      caseForm: {
        topLevel: [
          {
            name: 'id',
            insights: ['conversations' as InsightsObject, 'case'],
          },
        ],
        perpetrator: [
          {
            name: 'relationshipToChild',
            insights: ['customers' as InsightsObject, 'organization'],
          },
          {
            name: 'gender',
            insights: ['conversations' as InsightsObject, 'followed_by'],
          },
          {
            name: 'age',
            insights: ['conversations' as InsightsObject, 'preceded_by'],
          },
        ],
        incident: [
          {
            name: 'duration',
            insights: ['conversations' as InsightsObject, 'in_business_hours'],
          },
          {
            name: 'location',
            insights: ['customers' as InsightsObject, 'market_segment'],
          },
        ],
        referral: [
          {
            name: 'referredTo',
            insights: ['customers' as InsightsObject, 'customer_manager'],
          },
        ],
      },
    };

    const contactForm = {} as ContactRawJson;

    const caseForm: Case = {
      accountSid: 'AC123',
      categories: {},
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-01T00:00:00.000Z',
      id: 102,
      status: 'open',
      helpline: '',
      twilioWorkerId: 'worker',
      info: {
        summary: 'case summary',
        counsellorNotes: [
          {
            id: '1',
            note: 'my note',
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        perpetrators: [
          {
            id: '1',
            perpetrator: {
              firstName: 'first',
              lastName: 'last',
              relationshipToChild: 'Grandparent',
              gender: 'Boy',
              age: '>25',
              language: 'Bemba',
              nationality: 'Zambian',
              ethnicity: 'Bembese',
              streetAddress: '',
              city: '',
              stateOrCounty: '',
              postalCode: '',
              phone1: '',
              phone2: '',
            },
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        households: [
          {
            id: '1',
            household: {
              firstName: 'first',
              lastName: 'last',
              relationshipToChild: 'Mother',
              gender: 'Girl',
              age: '>25',
              language: 'Bemba',
              nationality: 'Zambian',
              ethnicity: 'Bembese',
              streetAddress: '',
              city: '',
              stateOrCounty: '',
              postalCode: '',
              phone1: '',
              phone2: '',
            },
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        referrals: [
          {
            id: '1',
            date: new Date().toISOString(),
            referredTo: 'Referral Agency 1',
            comments: 'A referral',
            createdAt: '',
            twilioWorkerId: '',
          },
          {
            id: '1',
            date: new Date().toISOString(),
            referredTo: 'Referral Agency 2',
            comments: 'Another referral',
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        incidents: [
          {
            id: '1',
            incident: {
              duration: '2',
              location: 'At home',
            },
            createdAt: '',
            twilioWorkerId: '',
          },
        ],
        followUpDate: '2021-01-30',
      },
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

    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });

  test('processHelplineConfig does not add caller fields for child call types', async () => {
    const helplineConfig: OneToOneConfigSpec = {
      contactForm: {
        callerInformation: [
          {
            name: 'gender',
            insights: ['conversations' as InsightsObject, 'conversation_attribute_4'],
          },
        ],
        childInformation: [
          {
            name: 'language',
            insights: ['conversations' as InsightsObject, 'language'],
          },
        ],
      },
    };

    const contactForm: ContactRawJson = {
      ...VALID_EMPTY_CONTACT.rawJson,
      callType: 'Child calling about self',

      callerInformation: {
        gender: 'Boy',
      },
      childInformation: {
        language: 'English',
      },
    };

    const caseForm = {} as Case;

    const expected = {
      conversations: {
        language: 'English',
      },
      customers: {},
    };

    expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
  });

  test('zambiaUpdates handles custom entries', () => {
    const contact: HrmServiceContact = {
      ...VALID_EMPTY_CONTACT,
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType: 'Child calling about self',

        callerInformation: {},
        childInformation: {
          province: 'Eastern',
          district: 'Sinda',
        },
      },
    };

    const returnedAttributes = zambiaUpdates({}, contact, {} as Case);
    expect(returnedAttributes.customers.area).toEqual('Eastern;Sinda');
  });
});

describe('InsightsService - buildInsightsData() (externalRecordings)', () => {
  test('Should add url provider block to attributes when passed a successful externalRecordingInfo', async () => {
    const previousAttributes = {
      taskSid: 'task-sid',
      channelType: channelTypes.voice,
      conversations: {
        content: 'content',
      },
      helpline: 'helpline',
    } as CustomITask['attributes'];

    const twilioTask = {
      attributes: previousAttributes,
    } as CustomITask;

    const contactForm: HrmServiceContact = {
      ...VALID_EMPTY_CONTACT,
      helpline: 'helpline',
      rawJson: {
        ...VALID_EMPTY_CONTACT.rawJson,
        callType: 'Child calling about self',
        contactlessTask: {
          channel: channelTypes.voice,
          date: '2020-12-30',
          time: '14:50',
          createdOnBehalfOf: undefined,
        },
        childInformation: {
          age: '3',
          gender: 'Unknown',
          language: 'language',
        },
        callerInformation: {
          age: '26',
          gender: 'Girl',
        },
        caseInformation: {},
        categories: { Violence: ['Unspecified/Other'] },
      },
    };

    const caseForm = {
      id: 123,
    } as Case;

    const externalRecordingInfo: ExternalRecordingInfo = {
      status: 'success',
      recordingSid: 'recordingSid',
      bucket: 'bucket',
      key: 'key',
    };

    const savedContact = {
      id: '123',
    } as HrmServiceContact;

    const result = buildInsightsData(twilioTask, contactForm, caseForm, savedContact, externalRecordingInfo);
    expect(result.conversations.media).toEqual([
      {
        type: 'VoiceRecording',
        url_provider:
          'http://fake.hrm.com/files/urls?method=getObject&objectType=contact&objectId=123&fileType=recording&bucket=bucket&key=key',
      },
    ]);
  });
});
