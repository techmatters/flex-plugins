/* eslint-disable camelcase */
import { ITask } from '@twilio/flex-ui';

import { isNonDataCallType } from '../states/ValidationRules';
import { mapChannelForInsights } from '../utils/mappers';
import { getDateTime } from '../utils/helpers';
import { TaskEntry } from '../states/contacts/reducer';
import { Case } from '../types/types';
import { formatCategories } from '../utils/formatters';

/*
 * 'Any'' is the best we can do, since we're limited by Twilio here.
 * See https://assets.flex.twilio.com/releases/flex-ui/1.18.0/docs/ITask.html
 */
type TaskAttributes = any;

type InsightsAttributes = {
  conversations?: { [key: string]: string };
  customers?: { [key: string]: string };
};

/*
 * Converts an array of categories with a fully-specified path (as stored in Redux)
 * into an object where the top-level categories are the keys and the values
 * are an array of subcategories (as returned from our API).
 * Example:
 * makeCategoryMap(['categories.Cat1.SubcatA', 'categories.Cat1.SubcatB', 'categories.Cat3.SubcatE'])
 *  returns:
 *   {
 *     "Cat1": ["SubcatA", "SubcatB"],
 *     "Cat3": ["SubcatE"],
 *   }
 */
const makeCategoryMap = (categories: string[]): { [category: string]: string[] } => {
  return categories.reduce((acc, fullPathCategory) => {
    const [, cat, subcat] = fullPathCategory.split('.');
    acc[cat] = acc[cat] || [];
    acc[cat].push(subcat);
    return acc;
  }, {});
};

const getSubcategories = (contactForm: TaskEntry): string => {
  if (!contactForm || !contactForm.categories) return '';

  const { categories } = contactForm;

  const categoryMap = makeCategoryMap(categories);
  return formatCategories(categoryMap).join(';');
};

const baseUpdates = (taskAttributes: TaskAttributes, contactForm: TaskEntry, caseForm: Case): InsightsAttributes => {
  const { callType } = contactForm;
  const hasCustomerData = !isNonDataCallType(callType);

  const communication_channel = taskAttributes.isContactlessTask
    ? mapChannelForInsights(contactForm.contactlessTask.channel)
    : mapChannelForInsights(taskAttributes.channelType);

  if (!hasCustomerData) {
    return {
      conversations: {
        conversation_attribute_2: callType.toString(),
        communication_channel,
      },
    };
  }

  const { childInformation } = contactForm;

  return {
    conversations: {
      conversation_attribute_1: getSubcategories(contactForm).toString(),
      conversation_attribute_2: callType,
      conversation_attribute_3: childInformation.gender.toString(),
      conversation_attribute_4: childInformation.age.toString(),
      communication_channel,
    },
    customers: {
      gender: childInformation.gender.toString(),
    },
  };
};

const contactlessTaskUpdates = (
  attributes: TaskAttributes,
  contactForm: TaskEntry,
  caseForm: Case,
): InsightsAttributes => {
  if (!attributes.isContactlessTask) {
    return {};
  }

  const dateTime = getDateTime(contactForm.contactlessTask);

  return {
    conversations: {
      date: dateTime.toString(),
    },
  };
};

enum InsightsObject {
  Customers = 'customers',
  Conversations = 'conversations',
}
type InsightsFieldSpec = {
  name: string;
  insights: [InsightsObject, string];
};
type InsightsSubFormSpec = InsightsFieldSpec[];
type InsightsFormSpec = { [key: string]: InsightsSubFormSpec };
type InsightsConfigSpec = {
  contactForm?: InsightsFormSpec;
  caseForm?: InsightsFormSpec;
};

const zambiaInsightsConfig: InsightsConfigSpec = {
  contactForm: {
    childInformation: [
      {
        name: 'village',
        insights: [InsightsObject.Customers, 'city'],
      },
      {
        name: 'language',
        insights: [InsightsObject.Conversations, 'language'],
      },
    ],
  },
};

export const processHelplineConfig = (
  contactForm: TaskEntry,
  caseForm: Case,
  configSpec: InsightsConfigSpec,
): InsightsAttributes => {
  const insightsAtts: InsightsAttributes = {
    customers: {},
    conversations: {},
  };
  const contactFormSpec: InsightsFormSpec = configSpec.contactForm;
  Object.keys(contactFormSpec).forEach(subform => {
    const fields: InsightsFieldSpec[] = contactFormSpec[subform];
    fields.forEach(field => {
      const [insightsObject, insightsField] = field.insights;
      insightsAtts[insightsObject][insightsField] = contactForm[subform][field.name];
    });
  });
  return insightsAtts;
};

const zambiaUpdates = (attributes: TaskAttributes, contactForm: TaskEntry, caseForm: Case): InsightsAttributes => {
  const { callType } = contactForm;
  if (!isNonDataCallType(callType)) return {};

  return {};
};

const mergeAttributes = (previousAttributes: TaskAttributes, newAttributes: InsightsAttributes): TaskAttributes => {
  return {
    ...previousAttributes,
    conversations: {
      ...previousAttributes.conversations,
      ...newAttributes.conversations,
    },
    customers: {
      ...previousAttributes.customers,
      ...newAttributes.customers,
    },
  };
};

/*
 * The idea here is to apply a cascading series of modifications to the attributes for Insights.
 * We may have a set of core values to add, plus conditional core values (such as if this is a
 * contactless task), and then may have helpline-specific updates based on configuration.
 * At present this is just a refactoring of the existing functionality, but next we will
 * add helpline-specific configuration.
 * We may add a configuration language similar to our customization JSON files
 * into the helpline-specific update functions to express them more clearly.
 */
export async function saveInsightsData(twilioTask: ITask, contactForm: TaskEntry, caseForm: Case) {
  const previousAttributes: TaskAttributes = twilioTask.attributes;
  const insightsUpdates: InsightsAttributes[] = [];
  insightsUpdates.push(baseUpdates(twilioTask.attributes, contactForm, caseForm));
  insightsUpdates.push(contactlessTaskUpdates(twilioTask.attributes, contactForm, caseForm));
  insightsUpdates.push(zambiaUpdates(twilioTask.attributes, contactForm, caseForm));
  const finalAttributes: TaskAttributes = insightsUpdates.reduce(
    (acc, curr) => mergeAttributes(acc, curr),
    previousAttributes,
  );

  await twilioTask.setAttributes(finalAttributes);
}
