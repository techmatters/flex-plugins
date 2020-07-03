/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';

function buildConversationsObject(task) {
  const callType = task.callType.value;

  return {
    conversation_attribute_2: callType,
  };
}

function buildCustomersObject(task) {
  const callType = task.callType.value;
  const hasCustomerData = !isNonDataCallType(callType);

  if (!hasCustomerData) return {};

  const { childInformation } = task;
  return {
    gender: childInformation.gender.value,
    customer_attribute_1: childInformation.age.value,
  };
}

function mergeAttributes(previousAttributes, { conversations, customers }) {
  return {
    ...previousAttributes,
    conversations: {
      ...previousAttributes.conversations,
      ...conversations,
    },
    customers: {
      ...previousAttributes.customers,
      ...customers,
    },
  };
}

export async function saveInsightsData(twilioTask, task) {
  const conversations = buildConversationsObject(task);
  const customers = buildCustomersObject(task);
  const previousAttributes = twilioTask.attributes;
  const newAttributes = mergeAttributes(previousAttributes, { conversations, customers });

  await twilioTask.setAttributes(newAttributes);
}
