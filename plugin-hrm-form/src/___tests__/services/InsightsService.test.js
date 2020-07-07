/* eslint-disable camelcase */
import { saveInsightsData } from '../../services/InsightsService';

test('saveInsightsData for non-data callType', async () => {
  const previousAttributtes = {
    taskSid: 'task-sid',
    conversations: {
      content: 'content',
    },
  };

  const twilioTask = {
    attributes: previousAttributtes,
    setAttributes: jest.fn(),
  };

  const task = {
    callType: {
      value: 'Abusive',
    },
  };

  await saveInsightsData(twilioTask, task);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    conversations: {
      content: 'content',
      conversation_attribute_2: 'Abusive',
    },
    customers: {},
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});

test('saveInsightsData for data callType', async () => {
  const previousAttributtes = {
    taskSid: 'task-sid',
    conversations: {
      content: 'content',
    },
    customers: {
      name: 'John Doe',
    },
  };

  const twilioTask = {
    attributes: previousAttributtes,
    setAttributes: jest.fn(),
  };

  const task = {
    callType: {
      value: 'Child calling about self',
    },
    childInformation: {
      age: {
        value: '13-15',
      },
      gender: {
        value: 'Boy',
      },
    },
    caseInformation: {
      categories: {
        'Missing children': {
          'Child abduction': {
            value: false,
          },
          'Unspecified/Other': {
            value: true,
          },
        },
        Violence: {
          Bullying: {
            value: true,
          },
          'Unspecified/Other': {
            value: false,
          },
        },
        'Mental Health': {
          'Addictive behaviours': {
            value: true,
          },
          'Unspecified/Other': {
            value: false,
          },
        },
      },
    },
  };

  await saveInsightsData(twilioTask, task);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    conversations: {
      content: 'content',
      conversation_attribute_1: 'Unspecified/Other - Missing children;Bullying',
      conversation_attribute_2: 'Child calling about self',
      conversation_attribute_3: 'Unspecified/Other - Missing children',
      conversation_attribute_4: 'Bullying',
    },
    customers: {
      name: 'John Doe',
      customer_attribute_1: '13-15',
      gender: 'Boy',
    },
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});
