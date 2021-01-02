/* eslint-disable camelcase */
import { processHelplineConfig, saveInsightsData, zambiaUpdates } from '../../services/InsightsService';
import { getDateTime } from '../../utils/helpers';

test('saveInsightsData for non-data callType', async () => {
  const previousAttributes = {
    taskSid: 'task-sid',
    channelType: 'sms',
    conversations: {
      content: 'content',
    },
  };

  const twilioTask = {
    attributes: previousAttributes,
    setAttributes: jest.fn(),
  };

  const contactForm = {
    callType: 'Abusive',
  };

  await saveInsightsData(twilioTask, contactForm);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    channelType: 'sms',
    conversations: {
      content: 'content',
      conversation_attribute_2: 'Abusive',
      communication_channel: 'SMS',
    },
    customers: {},
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});

test('saveInsightsData for data callType', async () => {
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
    },
    caseInformation: {},
    categories: [
      'categories.Missing children.Unspecified/Other',
      'categories.Violence.Bullying',
      'categories.Mental Health.Addictive behaviours and substance use',
    ],
  };

  await saveInsightsData(twilioTask, contactForm);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    channelType: 'voice',
    conversations: {
      content: 'content',
      conversation_attribute_1: 'Unspecified/Other - Missing children;Bullying;Addictive behaviours and substance use',
      conversation_attribute_2: 'Child calling about self',
      communication_channel: 'Call',
    },
    customers: {
      name: 'John Doe',
    },
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
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
  const task = {
    callType: 'Child calling about self',
    contactlessTask: {
      channel: 'sms',
      date,
      time,
    },
    childInformation: {
      age: '3',
      gender: 'Unknown',
    },
    caseInformation: {},
    categories: ['categories.Violence.Unspecified/Other'],
  };

  await saveInsightsData(twilioTask, task);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    isContactlessTask: true,
    channelType: 'default',
    conversations: {
      conversation_attribute_1: 'Unspecified/Other - Violence',
      conversation_attribute_2: 'Child calling about self',
      communication_channel: 'SMS',
      date: getDateTime({ date, time }),
    },
    customers: {},
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
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
