/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';
import { isNotCategory, isNotSubcategory } from '../states/ContactFormStateFactory';
import { mapChannelForInsights } from '../utils/mappers';
import { getDateTime } from '../utils/helpers';

function getSubcategories(task) {
  if (!task || !task.caseInformation || !task.caseInformation.categories) return [];

  const categories = Object.entries(task.caseInformation.categories).filter(([name]) => !isNotCategory(name));
  const result = [];

  categories.forEach(([categoryKey, subcategories]) => {
    const subcategoriesKeys = Object.keys(subcategories).filter(subcategory => !isNotSubcategory(subcategory));
    subcategoriesKeys.forEach(subcategoryKey => {
      const { value } = subcategories[subcategoryKey];
      if (value) {
        const tag = subcategoryKey === 'Unspecified/Other' ? `Unspecified/Other - ${categoryKey}` : subcategoryKey;
        result.push(tag);
      }
    });
  });

  return result.splice(0, 3);
}

function buildConversationsObject(taskAttributes, form) {
  const callType = form.callType.value;
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

  const subcategories = getSubcategories(form);
  const { childInformation } = form;

  return {
    conversation_attribute_1: subcategories.join(';'),
    conversation_attribute_2: callType,
    conversation_attribute_3: childInformation.gender.value,
    conversation_attribute_4: childInformation.age.value,
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
