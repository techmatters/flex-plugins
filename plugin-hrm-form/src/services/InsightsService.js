/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';
import { mapChannelForInsights } from '../utils/mappers';
import { getDateTime } from '../utils/helpers';

function getSubcategories(form) {
  if (!form || !form.categories) return [];

  const { categories } = form;

  return categories.splice(0, 3).join(';');
}

function buildConversationsObject(taskAttributes, form) {
  const { callType } = form;
  const hasCustomerData = !isNonDataCallType(callType);

  const communication_channel = taskAttributes.isContactlessTask
    ? mapChannelForInsights(form.contactlessTask.channel)
    : mapChannelForInsights(taskAttributes.channelType);

  if (!hasCustomerData) {
    return {
      conversation_attribute_2: callType,
      communication_channel,
    };
  }

  const { childInformation } = form;

  return {
    conversation_attribute_1: getSubcategories(form),
    conversation_attribute_2: callType,
    conversation_attribute_3: childInformation.gender,
    conversation_attribute_4: childInformation.age,
    communication_channel,
  };
}

function mergeAttributes(previousAttributes, { conversations }) {
  return {
    ...previousAttributes,
    conversations: {
      ...previousAttributes.conversations,
      ...conversations,
    },
  };
}

const overrideAttributes = (attributes, form) => {
  const dateTime = getDateTime(form.contactlessTask);

  return {
    ...attributes,
    conversations: {
      ...attributes.conversations,
      date: dateTime,
    },
  };
};

export async function saveInsightsData(twilioTask, form) {
  const conversations = buildConversationsObject(twilioTask.attributes, form);
  const previousAttributes = twilioTask.attributes;
  const mergedAttributes = mergeAttributes(previousAttributes, { conversations });
  const finalAttributes = previousAttributes.isContactlessTask
    ? overrideAttributes(mergedAttributes, form)
    : mergedAttributes;

  await twilioTask.setAttributes(finalAttributes);
}
