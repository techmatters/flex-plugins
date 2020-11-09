/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';
import { isNotCategory, isNotSubcategory } from '../states/ContactFormStateFactory';
import { mapChannelForInsights } from '../utils/mappers';

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

function buildConversationsObject(taskAttributes, task) {
  const callType = task.callType.value;
  const hasCustomerData = !isNonDataCallType(callType);

  if (!hasCustomerData) {
    return {
      conversation_attribute_2: callType,
      conversation_attribute_6: mapChannelForInsights(taskAttributes.channelType),
    };
  }

  const subcategories = getSubcategories(task);
  const { childInformation } = task;

  return {
    conversation_attribute_1: subcategories.join(';'),
    conversation_attribute_2: callType,
    conversation_attribute_3: childInformation.gender.value,
    conversation_attribute_4: childInformation.age.value,
    conversation_attribute_6: mapChannelForInsights(taskAttributes.channelType),

    // date: Date.now(), // overrides task's date and time
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

export async function saveInsightsData(twilioTask, task) {
  const conversations = buildConversationsObject(twilioTask.attributes, task);
  const previousAttributes = twilioTask.attributes;
  const newAttributes = mergeAttributes(previousAttributes, { conversations });

  await twilioTask.setAttributes(newAttributes);
}
