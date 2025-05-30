/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable camelcase */
import { cloneDeep, get } from 'lodash';
import {callTypes, FormValue} from 'hrm-types';
import {
  DefinitionVersion,
  FieldType,
  InsightsFieldSpec,
  InsightsFormSpec,
  OneToManyConfigSpec,
  OneToManyConfigSpecs,
  OneToOneConfigSpec,
} from 'hrm-form-definitions';
import { parseISO } from 'date-fns';

import { isNonDataCallType } from '../states/validationRules';
import { formatCategories, mapChannelForInsights } from '../utils';
import { Case, Contact, ContactRawJson, CustomITask } from '../types/types';
import { getDefinitionVersions, getHrmConfig } from '../hrmConfig';
import {
  ExternalRecordingInfo,
  ExternalRecordingInfoSuccess,
  isSuccessfulExternalRecordingInfo,
} from './getExternalRecordingInfo';
import { generateUrl } from './fetchApi';
import { generateSignedURLPath } from './fetchHrmApi';
import { shouldSendInsightsData } from '../utils/shouldSendInsightsData';
import { ApiCaseSection, CaseSectionTypeSpecificData, FullCaseSection } from './caseSectionService';
import { CaseStateEntry } from '../states/case/types';

/*
 * 'Any' is the best we can do, since we're limited by Twilio here.
 * See https://assets.flex.twilio.com/releases/flex-ui/1.18.0/docs/ITask.html
 */
type TaskAttributes = any;

type InsightsAttributes = {
  conversations?: { [key: string]: string | number };
  customers?: { [key: string]: string | number };
};

const delimiter = ';';

type InsightsUpdateFunction = (
  attributes: TaskAttributes,
  contactForm: Contact,
  caseForm: Pick<CaseStateEntry, 'sections' | 'connectedCase'>,
  savedContact: Contact,
) => InsightsAttributes;

const sanitizeInsightsValue = (value: FormValue) => {
  if (typeof value === 'string' && value) return value;

  if (typeof value === 'boolean') return value.toString();

  if (typeof value === 'number') return value;

  if (Array.isArray(value)) return value.map(sanitizeInsightsValue).join(delimiter);

  return null;
};

const COMMUNICATION_CHANNEL = 'communication_channel';
const SUBCATEGORIES = 'conversation_attribute_1';
const CALLTYPE = 'conversation_attribute_2';
const CALLER_AGE = 'conversation_attribute_3';
const CALLER_GENDER = 'conversation_attribute_4';
const HELPLINE = 'conversation_attribute_8';
const LANGUAGE = 'language';
const CHILD_AGE = 'year_of_birth';
const CHILD_GENDER = 'gender';

/**
 * This are the core attributes that should be present for all kind of contacts, returned by baseUpdates function.
 * Note this is a specialization of the InsightsAttributes type
 */
type CoreAttributes = {
  conversations: {
    conversation_attribute_5: null; // This field is cleared for later use
    [COMMUNICATION_CHANNEL]: string;
    [SUBCATEGORIES]?: string;
    [CALLTYPE]: string;
    [CALLER_AGE]: string;
    [CALLER_GENDER]: string;
    [HELPLINE]: string;
    [LANGUAGE]: string;
  };
  customers: {
    [CHILD_AGE]: string;
    [CHILD_GENDER]: string;
  };
};

/**
 * Updates that will be performed for every helpline, using a bunch of fixed Insights fields. The fields that should not be added to the custom mapping are:
 * Conversations object:
 *  - communication_channel
 *  - conversation_attribute_1
 *  - conversation_attribute_2
 *  - conversation_attribute_3
 *  - conversation_attribute_4
 *  - conversation_attribute_8
 *  - language
 * Customers object:
 *  - year_of_birth
 *  - gender
 */
const baseUpdates: InsightsUpdateFunction = (
  taskAttributes: TaskAttributes,
  { rawJson: { callType, contactlessTask, childInformation, callerInformation, categories }, helpline }: Contact,
): CoreAttributes => {
  const communication_channel = taskAttributes.isContactlessTask
    ? mapChannelForInsights(contactlessTask.channel)
    : mapChannelForInsights(taskAttributes.customChannelType || taskAttributes.channelType);

  // First add the data we add whether or not there's contact form data
  const coreAttributes: CoreAttributes = {
    conversations: {
      /*
       * By default, Twilio populates attribute 5 with the Task ID, but we
       * overwrite it for data contacts so we want it null for non-data contacts.
       * We'll set it to null in case this is a non-data contact,
       * and then let other updates overwrite again later for data contacts.
       */
      conversation_attribute_5: null,
      /**
       * Fields that should always be populated, whether it is a data contact or not.
       */
      [COMMUNICATION_CHANNEL]: communication_channel,
      [CALLTYPE]: sanitizeInsightsValue(callType),
      [CALLER_AGE]: sanitizeInsightsValue(callerInformation.age),
      [CALLER_GENDER]: sanitizeInsightsValue(callerInformation.gender),
      [HELPLINE]: sanitizeInsightsValue(helpline),
      [LANGUAGE]: sanitizeInsightsValue(childInformation.language),
    },
    customers: {
      [CHILD_AGE]: sanitizeInsightsValue(childInformation.age),
      [CHILD_GENDER]: sanitizeInsightsValue(childInformation.gender),
    },
  };

  if (isNonDataCallType(callType)) {
    return coreAttributes;
  }

  return {
    ...coreAttributes,
    conversations: {
      ...coreAttributes.conversations,
      [SUBCATEGORIES]: formatCategories(categories).join(delimiter),
    },
  };
};

const contactlessTaskUpdates: InsightsUpdateFunction = (
  attributes: TaskAttributes,
  { timeOfContact }: Contact,
): InsightsAttributes => {
  if (!attributes.isContactlessTask) {
    return {};
  }
  const dateTime = parseISO(timeOfContact).getTime();

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
  } else if (v === null) {
    return null;
  }
  console.error(`Bad mixed checkbox value [${v}], defaulting to null for Insights value`);
  return null;
};

type InsightsCaseForm = Record<string, { [key: string]: string | boolean }>;

const flattenFirstCaseSection = (
  sections: Record<string, FullCaseSection>,
): Omit<ApiCaseSection, 'sectionTypeSpecificData'> & CaseSectionTypeSpecificData => {
  if (sections) {
    /*
     * Flatten out the section object. This can be changed after this is using the
     * customization framework.
     */
    const sortedList = Object.values(sections).sort((a, b) => a.eventTimestamp.getTime() - b.createdAt.getTime());
    if (sortedList.length) {
      const { sectionTypeSpecificData, createdAt, updatedAt, eventTimestamp, ...theRest } = sortedList[0];
      return {
        ...theRest,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt?.toISOString(),
        eventTimestamp: eventTimestamp?.toISOString(),
        ...sectionTypeSpecificData,
      };
    }
  }
  return undefined;
};

/*
 * This takes a Case and turns it into a format more like the subforms
 * for a SearchStateTaskEntry (contact form) so it can be consumed in the same manner.
 * As of January 2, 2021, Case has not been moved over to use the
 * customization framework.  When it is, we will need to change this function.
 */
const convertCaseFormForInsights = (caseForm: Case, sections: CaseStateEntry['sections']): InsightsCaseForm => {
  if (!caseForm || Object.keys(caseForm).length === 0) return {};
  const logObject: any = {
    caseId: caseForm.id,
    accountSid: caseForm.accountSid,
    twilioWorkerId: caseForm.twilioWorkerId,
  };
  try {
    const flattenedSectionEntries = Object.entries(sections).map(
      ([sectionTypeName, sectionsForType]) => [sectionTypeName, flattenFirstCaseSection(sectionsForType)] as const,
    );
    const topLevel = {
      id: caseForm.id.toString(),
    };

    console.warn(`[InsightsService] converting case form:`, logObject);

    return {
      ...Object.fromEntries(flattenedSectionEntries),
      topLevel,
    };
  } catch (error) {
    logObject.message = error;
    console.error(`[InsightsService] Error converting case form:`, logObject);
    throw error;
  }
};

const processHelplineConfig = (
  contact: Contact,
  caseState: Pick<CaseStateEntry, 'sections' | 'connectedCase'>,
  oneToOneConfigSpec: OneToOneConfigSpec,
): InsightsAttributes => {
  const { connectedCase: caseForm, sections } = caseState ?? {};
  const { rawJson: contactForm, id: contactId, twilioWorkerId, caseId, accountSid } = contact;
  const logObject: any = {
    accountSid,
    contactId,
    twilioWorkerId,
    caseId,
  };
  try {
    const insightsAtts: InsightsAttributes = {
      customers: {},
      conversations: {},
    };

    const formsToProcess: [InsightsFormSpec, ContactRawJson | InsightsCaseForm][] = [];
    if (oneToOneConfigSpec.contactForm) {
      // Clone the whole object to avoid modifying the real spec. May not be needed.
      const contactSpec = cloneDeep(oneToOneConfigSpec.contactForm);
      if (contactForm.callType !== callTypes.caller) {
        // If this isn't a caller type, don't save the caller form data
        contactSpec.callerInformation = [];
      }
      formsToProcess.push([contactSpec, contactForm]);
    }
    if (oneToOneConfigSpec.caseForm) {
      formsToProcess.push([oneToOneConfigSpec.caseForm, convertCaseFormForInsights(caseForm, sections)]);
    }
    formsToProcess.forEach(([spec, form]) => {
      Object.keys(spec).forEach(subform => {
        const fields: InsightsFieldSpec[] = spec[subform];
        fields.forEach(field => {
          const [insightsObject, insightsField] = field.insights;
          let value = form[subform] && form[subform][field.name];
          if (field.type === FieldType.MixedCheckbox) {
            value = convertMixedCheckbox(value);
          }
          insightsAtts[insightsObject][insightsField] = sanitizeInsightsValue(value);
        });
      });
    });

    console.warn(`[InsightsService] converting case form:`, logObject);

    return insightsAtts;
  } catch (error) {
    logObject.message = error;
    console.error(`[InsightsService] Error converting case form:`, logObject);
    throw error;
  }
};

const applyCustomUpdate = (customUpdate: OneToManyConfigSpec): InsightsUpdateFunction => {
  return (taskAttributes, { rawJson }, caseForm, savedContact) => {
    // If it's non data, and specs don't explicitly say to save it, ommit the update
    if (isNonDataCallType(rawJson.callType) && !customUpdate.saveForNonDataContacts) return {};

    const dataSource = { taskAttributes, contactForm: rawJson, caseForm, savedContact };
    // concatenate the values, taken from dataSource using paths (e.g. 'contactForm.childInformation.province')
    const value = customUpdate.paths.map(path => sanitizeInsightsValue(get(dataSource, path, ''))).join(delimiter);

    return {
      [customUpdate.insightsObject]: {
        [customUpdate.attributeName]: value,
      },
    };
  };
};

const bindApplyCustomUpdates = (customConfigObject: {
  oneToManyConfigSpecs: OneToManyConfigSpecs;
  oneToOneConfigSpec: OneToOneConfigSpec;
}): InsightsUpdateFunction[] => {
  const getProcessedAtts: InsightsUpdateFunction = (attributes, contact, caseForm) =>
    isNonDataCallType(contact.rawJson.callType)
      ? {}
      : processHelplineConfig(contact, caseForm, customConfigObject.oneToOneConfigSpec);

  const customUpdatesFuns = customConfigObject.oneToManyConfigSpecs.map(applyCustomUpdate);

  return [getProcessedAtts, ...customUpdatesFuns];
};

const mergeAttributes = (previousAttributes: TaskAttributes, newAttributes: InsightsAttributes): TaskAttributes => {
  return {
    ...previousAttributes,
    ...newAttributes,
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

const getInsightsUpdateFunctionsForConfig = (
  customInsights: DefinitionVersion['insights'],
): InsightsUpdateFunction[] => {
  const applyCustomUpdates = bindApplyCustomUpdates(customInsights);

  return [baseUpdates, contactlessTaskUpdates, ...applyCustomUpdates];
};

const generateUrlProviderBlock = (externalRecordingInfo: ExternalRecordingInfoSuccess, contact: Contact) => {
  const { bucket, key } = externalRecordingInfo;
  const { hrmBaseUrl } = getHrmConfig();

  const logObject: any = {
    taskId: contact.taskId,
    channelType: contact.channel,
    accountSid: contact.accountSid,
    twilioWorkerId: contact.twilioWorkerId,
  };

  try {
    const url_provider = generateUrl(
      new URL(hrmBaseUrl),
      generateSignedURLPath({
        method: 'getObject',
        objectType: 'contact',
        objectId: contact.id.toString(),
        fileType: 'recording',
        location: { bucket, key },
      }),
    );

    console.warn(`[InsightsService] converting contact:`, logObject);

    return [
      {
        type: 'VoiceRecording',
        url_provider,
      },
    ];
  } catch (error) {
    logObject.message = `Error generating mediaUrl, ${error}`;
    console.error(`[InsightsService] Error converting contact:`, logObject);
    throw new Error('Error generating mediaUrl');
  }
};

/*
 * The idea here is to apply a cascading series of modifications to the attributes for Insights.
 * We may have a set of core values to add, plus conditional core values (such as if this is a
 * contactless task), and then may have helpline-specific updates based on configuration.
 *
 * Note: config parameter tells where to go to get helpline-specific tests.  It should
 * eventually match up with getConfig().  Also useful for testing.
 */
export const buildInsightsData = (
  task: CustomITask,
  contact: Contact,
  caseState: Pick<CaseStateEntry, 'sections' | 'connectedCase'>,
  savedContact: Contact,
  externalRecordingInfo?: ExternalRecordingInfo,
) => {
  const logObject: any = {
    taskId: task.taskSid,
    channelType: task.channelType,
    accountSid: savedContact.accountSid,
    twilioWorkerId: savedContact.twilioWorkerId,
  };
  try {
    const previousAttributes = typeof task.attributes === 'string' ? JSON.parse(task.attributes) : task.attributes;

    if (!shouldSendInsightsData(task)) return previousAttributes;

    const { currentDefinitionVersion } = getDefinitionVersions();

    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const finalAttributes: TaskAttributes = getInsightsUpdateFunctionsForConfig(currentDefinitionVersion.insights)
      .map(f => f(previousAttributes, contact, caseState, savedContact))
      .reduce((acc: TaskAttributes, curr: InsightsAttributes) => mergeAttributes(acc, curr), previousAttributes);

    // TODO: replace with a url provider that doesn't require the recording SID, but can use the task ID or contact ID to look it up at query time
    if (isSuccessfulExternalRecordingInfo(externalRecordingInfo)) {
      const urlProviderBlock = generateUrlProviderBlock(externalRecordingInfo, savedContact);
      finalAttributes.conversations = {
        ...finalAttributes.conversations,
        media: [...(finalAttributes.conversations.media || []), ...urlProviderBlock],
      };
    }

    console.warn(`[InsightsService] converting savedContact:`, logObject);

    return finalAttributes;
  } catch (error) {
    logObject.message = error;
    console.error(`[InsightsService] Error converting savedContact:`, logObject);
    throw error;
  }
};
