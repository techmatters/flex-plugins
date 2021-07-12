/* eslint-disable camelcase */
import '../mockGetConfig'; // This causes the definition version to be "v1" (i.e. Zambia v1), hence that's what we gonna use to match the tests
import {
  baseUpdates,
  contactlessTaskUpdates,
  processHelplineConfig,
  mergeAttributes,
  buildInsightsData,
} from '../../services/InsightsService';
import { getDateTime } from '../../utils/helpers';
import v1 from '../../formDefinitions/v1';

/*
 * This helper matches the way attributes were updated previous the changes Gian introduced in https://github.com/tech-matters/flex-plugins/pull/364/commits/9d09afec0db49716ef0b7518aaa5f7bc6159db64
 * Used to test that the attributes matches with what we expected before
 */
const zambiaUpdates = (attributes, contactForm, caseForm) => {
  const attsToReturn = processHelplineConfig(contactForm, caseForm, v1.insights.oneToOneConfigSpec);

  attsToReturn.customers.area = [contactForm.childInformation.province, contactForm.childInformation.district].join(
    ';',
  );

  return attsToReturn;
};

const expectWithV1Zambia = (attributes, contactForm, caseForm, submissionContext) =>
  [baseUpdates, contactlessTaskUpdates, zambiaUpdates]
    .map(f => f(attributes, contactForm, caseForm, submissionContext))
    .reduce((acc, curr) => mergeAttributes(acc, curr), { ...attributes });

test('Insights Data for non-data callType', async () => {
  const previousAttributes = {
    taskSid: 'task-sid',
    channelType: 'sms',
    conversations: {
      content: 'content',
    },
    helpline: 'helpline',
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const contactForm = {
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
  };

  const result = buildInsightsData(twilioTask, contactForm, {}, { helplineToSave: previousAttributes.helpline });

  const expectedNewAttributes = {
    ...previousAttributes,
    conversations: {
      content: 'content',
      conversation_attribute_2: 'Abusive',
      conversation_attribute_5: null,
      communication_channel: 'SMS',
      conversation_attribute_3: contactForm.callerInformation.age,
      conversation_attribute_4: contactForm.callerInformation.gender,
      conversation_attribute_8: previousAttributes.helpline,
      language: contactForm.childInformation.language,
    },
    customers: {
      year_of_birth: contactForm.childInformation.age,
      gender: contactForm.childInformation.gender,
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
    helpline: 'helpline',
    helplineToSave: 'helpline',
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const contactForm = {
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
  };

  const result = buildInsightsData(twilioTask, contactForm, {}, { helplineToSave: previousAttributes.helpline });

  const expectedNewAttributes = {
    ...previousAttributes,
    conversations: {
      content: 'content',
      conversation_attribute_2: 'Abusive',
      conversation_attribute_5: null,
      communication_channel: 'SMS',
      conversation_attribute_3: null,
      conversation_attribute_4: null,
      conversation_attribute_8: previousAttributes.helpline,
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
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const contactForm = {
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
    categories: [
      'categories.Missing children.Unspecified/Other',
      'categories.Violence.Bullying',
      'categories.Mental Health.Addictive behaviours and substance use',
    ],
  };

  const caseForm = {
    id: 123,
  };

  const submissionContext = { helplineToSave: previousAttributes.helpline };

  const expectedNewAttributes = expectWithV1Zambia(twilioTask.attributes, contactForm, caseForm, submissionContext);

  const result = buildInsightsData(twilioTask, contactForm, caseForm, submissionContext);

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
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const date = '2020-12-30';
  const time = '14:50';
  const contactForm = {
    callType: 'Child calling about self',
    contactlessTask: {
      channel: 'sms',
      date,
      time,
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
    categories: ['categories.Violence.Unspecified/Other'],
  };

  const caseForm = {
    id: 123,
  };

  const submissionContext = { helplineToSave: previousAttributes.helpline };

  const expectedNewAttributes = expectWithV1Zambia(twilioTask.attributes, contactForm, caseForm, submissionContext);

  const result = buildInsightsData(twilioTask, contactForm, caseForm, submissionContext);

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

  expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);

  contactForm.childInformation.hivPositive = true;
  expected.customers.category = 1;
  expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);

  contactForm.childInformation.hivPositive = false;
  expected.customers.category = 0;
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

  expect(processHelplineConfig(contactForm, caseForm, helplineConfig)).toEqual(expected);
});

test('zambiaUpdates handles custom entries', () => {
  const contactForm = {
    callType: 'Child calling about self',

    callerInformation: {},
    childInformation: {
      province: 'Eastern',
      district: 'Sinda',
    },
    caseInformation: {},
    categories: [],
  };

  const returnedAttributes = zambiaUpdates({}, contactForm, {});
  expect(returnedAttributes.customers.area).toEqual('Eastern;Sinda');
});
