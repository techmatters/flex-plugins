/* eslint-disable camelcase */
import { isNonDataCallType } from '../states/ValidationRules';
import { isNotCategory, isNotSubcategory } from '../states/ContactFormStateFactory';

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

  return result.splice(0, 2);
}

function buildConversationsObject(task) {
  const callType = task.callType.value;
  const hasCustomerData = !isNonDataCallType(callType);

  if (!hasCustomerData) return { conversation_attribute_2: callType };

  const subcategories = getSubcategories(task);

  return {
    conversation_attribute_1: subcategories.join(';'),
    conversation_attribute_2: callType,
    conversation_attribute_3: subcategories[0],
    conversation_attribute_4: subcategories[1],
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
