/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';
import { mapChannelForInsights } from '../utils/mappers';
import { getDateTime } from '../utils/helpers';
import { TaskEntry } from 'states/contacts/reducer';
import { ITask } from '@twilio/flex-ui';

// How do we do this?  Twilio docs just define it as an Object
// See https://assets.flex.twilio.com/releases/flex-ui/1.18.0/docs/ITask.html
type TaskAttributes = any;

function getSubcategories(contactForm: TaskEntry) {
  if (!contactForm || !contactForm.categories) return [];

  const { categories } = contactForm;

  return categories.splice(0, 3).join(';');
}

function buildCustomersObject(taskAttributes: TaskAttributes, contactForm: TaskEntry) : TaskAttributes {
  const { callType } = contactForm;
  const hasCustomerData = !isNonDataCallType(callType);

  if (!hasCustomerData) return { };

  const { childInformation } = contactForm;
  return {
    gender: childInformation.gender,
  };
}

function buildConversationsObject(taskAttributes: TaskAttributes, contactForm: TaskEntry) : TaskAttributes {
  const { callType } = contactForm;
  const hasCustomerData = !isNonDataCallType(callType);

  const communication_channel = taskAttributes.isContactlessTask
    ? mapChannelForInsights(contactForm.contactlessTask.channel)
    : mapChannelForInsights(taskAttributes.channelType);

  if (!hasCustomerData) {
    return {
      conversation_attribute_2: callType,
      communication_channel,
    };
  }

  const { childInformation } = contactForm;

  return {
    conversation_attribute_1: getSubcategories(contactForm),
    conversation_attribute_2: callType,
    conversation_attribute_3: childInformation.gender,
    conversation_attribute_4: childInformation.age,
    communication_channel,
  };
}

function mergeAttributes(previousAttributes: TaskAttributes, { conversations, customers }) : TaskAttributes {
  return {
    ...previousAttributes,
    conversations: {
      ...previousAttributes.conversations,
      ...conversations,
    },
    customers: {
      ...previousAttributes.customers,
      ...customers,
    }
  };
}

const overrideAttributes = (attributes: TaskAttributes, contactForm: TaskEntry) : TaskAttributes => {
  const dateTime = getDateTime(contactForm.contactlessTask);

  return {
    ...attributes,
    conversations: {
      ...attributes.conversations,
      date: dateTime,
    },
  };
};

export async function saveInsightsData(twilioTask: ITask, contactForm: TaskEntry) {
  const conversations = buildConversationsObject(twilioTask.attributes, contactForm);
  const customers = buildCustomersObject(twilioTask.attributes, contactForm);
  const previousAttributes = twilioTask.attributes;
  const mergedAttributes = mergeAttributes(previousAttributes, { conversations, customers });
  const finalAttributes = previousAttributes.isContactlessTask
    ? overrideAttributes(mergedAttributes, contactForm)
    : mergedAttributes;

  await twilioTask.setAttributes(finalAttributes);
}
