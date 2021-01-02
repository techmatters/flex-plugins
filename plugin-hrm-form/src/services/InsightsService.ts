/* eslint-disable camelcase */
import { ITask } from '@twilio/flex-ui';

import { isNonDataCallType } from '../states/ValidationRules';
import { mapChannelForInsights } from '../utils/mappers';
import { getDateTime } from '../utils/helpers';
import { TaskEntry } from '../states/contacts/reducer';
import { Case } from '../types/types';
import { formatCategories } from '../utils/formatters';
import { zambiaInsightsConfig } from '../insightsConfig/zambia';
import {
  InsightsObject,
  FieldType,
  InsightsFieldSpec,
  InsightsFormSpec,
  InsightsConfigSpec,
} from '../insightsConfig/types';

/*
 * 'Any'' is the best we can do, since we're limited by Twilio here.
 * See https://assets.flex.twilio.com/releases/flex-ui/1.18.0/docs/ITask.html
 */
type TaskAttributes = any;

type InsightsAttributes = {
  conversations?: { [key: string]: string | number };
  customers?: { [key: string]: string | number };
};

const delimiter = ';';
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
  return formatCategories(categoryMap).join(delimiter);
};

const baseUpdates = (taskAttributes: TaskAttributes, contactForm: TaskEntry, caseForm: Case): InsightsAttributes => {
  const { callType } = contactForm;
  const hasCustomerData = !isNonDataCallType(callType);

  const communication_channel = taskAttributes.isContactlessTask
    ? mapChannelForInsights(contactForm.contactlessTask.channel)
    : mapChannelForInsights(taskAttributes.channelType);

  // First add the data we add whether or not there's contact form data
  const coreAttributes: InsightsAttributes = {
    conversations: {
      conversation_attribute_2: callType.toString(),
      communication_channel,
    },
  };

  if (!hasCustomerData) {
    return coreAttributes;
  }
  return {
    conversations: {
      ...coreAttributes.conversations,
      conversation_attribute_1: getSubcategories(contactForm).toString(),
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
      date: dateTime,
    },
  };
};

const convertMixedCheckbox = (v: string | boolean): number => {
  if (v === true) {
    return 1;
  } else if (v === false) {
    return 0;
  } else if (v === 'mixed') {
    return null;
  }
  console.error(`Bad mixed checkbox value [${v}], defaulting to null for Insights value`);
  return null;
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
      let value = contactForm[subform][field.name];
      if (field.type === FieldType.MixedCheckbox) {
        value = convertMixedCheckbox(value);
      }
      insightsAtts[insightsObject][insightsField] = value;
    });
  });
  /*
   * console.warn(`processconfig results:`);
   * console.warn(insightsAtts);
   */
  return insightsAtts;
};

// Visible for testing
export const zambiaUpdates = (
  attributes: TaskAttributes,
  contactForm: TaskEntry,
  caseForm: Case,
): InsightsAttributes => {
  const { callType } = contactForm;
  if (isNonDataCallType(callType)) return {};

  const attsToReturn: InsightsAttributes = processHelplineConfig(contactForm, caseForm, zambiaInsightsConfig);

  /*
   * Custom additions
   * Add province and district into area
   */
  attsToReturn[InsightsObject.Customers].area = [
    contactForm.childInformation.province,
    contactForm.childInformation.district,
  ].join(delimiter);

  return attsToReturn;
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

// how do we type function return values in typescript?
const getInsightsUpdateFunctionsForConfig = (config: any): any => {
  const functionArray = [baseUpdates, contactlessTaskUpdates];
  if (config.useZambiaInsights) {
    functionArray.push(zambiaUpdates);
  }
  return functionArray;
};

/*
 * The idea here is to apply a cascading series of modifications to the attributes for Insights.
 * We may have a set of core values to add, plus conditional core values (such as if this is a
 * contactless task), and then may have helpline-specific updates based on configuration.
 * At present this is just a refactoring of the existing functionality, but next we will
 * add helpline-specific configuration.
 * We may add a configuration language similar to our customization JSON files
 * into the helpline-specific update functions to express them more clearly.
 *
 * Note: config parameter tells where to go to get helpline-specific tests.  It should
 * eventually match up with getConfig().  Also useful for testing.
 */
export async function saveInsightsData(twilioTask: ITask, contactForm: TaskEntry, caseForm: Case, config = {}) {
  const previousAttributes: TaskAttributes = twilioTask.attributes;
  const insightsUpdates: InsightsAttributes[] = getInsightsUpdateFunctionsForConfig(config).map((f: any) =>
    f(twilioTask.attributes, contactForm, caseForm),
  );
  const finalAttributes: TaskAttributes = insightsUpdates.reduce(
    (acc, curr) => mergeAttributes(acc, curr),
    previousAttributes,
  );

  await twilioTask.setAttributes(finalAttributes);
}
