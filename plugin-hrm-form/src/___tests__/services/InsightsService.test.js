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
      conversation_attribute_1: 'Abusive',
    },
    customers: {},
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});

test('saveInsightsData for non-data callType', async () => {
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
  };

  await saveInsightsData(twilioTask, task);

  const expectedNewAttributes = {
    taskSid: 'task-sid',
    conversations: {
      content: 'content',
      conversation_attribute_1: 'Child calling about self',
    },
    customers: {
      name: 'John Doe',
      customer_attribute_1: '13-15',
      gender: 'Boy',
    },
  };

  expect(twilioTask.setAttributes).toHaveBeenCalledWith(expectedNewAttributes);
});
