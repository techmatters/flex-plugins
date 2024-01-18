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
import {
  callTypes,
  DefinitionVersion,
  FieldType,
  InsightsFieldSpec,
  InsightsFormSpec,
  OneToManyConfigSpec,
  OneToManyConfigSpecs,
  OneToOneConfigSpec,
} from 'hrm-form-definitions';

import { isNonDataCallType } from '../states/validationRules';
import { formatCategories, mapChannelForInsights } from '../utils';
import { getDateTime } from '../utils/helpers';
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
  caseForm: Case,
  savedContact: Contact,
) => InsightsAttributes;

const sanitizeInsightsValue = (value: string | boolean) => {
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
    : mapChannelForInsights(taskAttributes.channelType);

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
  { rawJson: { contactlessTask } }: Contact,
): InsightsAttributes => {
  if (!attributes.isContactlessTask) {
    return {};
  }
  const { date, time } = contactlessTask;
  const dateTime = getDateTime({ date: date as string, time: time as string });

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

type InsightsCaseForm = {
  topLevel?: { [key: string]: string };
  perpetrator?: { [key: string]: string };
  incident?: { [key: string]: string | boolean };
  referral?: { [key: string]: string };
  household?: { [key: string]: string };
};

/*
 * This takes a Case and turns it into a format more like the subforms
 * for a SearchStateTaskEntry (contact form) so it can be consumed in the same manner.
 * As of January 2, 2021, Case has not been moved over to use the
 * customization framework.  When it is, we will need to change this function.
 */
const convertCaseFormForInsights = (caseForm: Case): InsightsCaseForm => {
  if (!caseForm || Object.keys(caseForm).length === 0) return {};
  let perpetrator: { [key: string]: string } = undefined;
  let incident: { [key: string]: string | boolean } = undefined;
  let referral: { [key: string]: string } = undefined;
  let household: { [key: string]: string } = undefined;
  const topLevel = {
    id: caseForm.id.toString(),
  };
  if (caseForm.info?.perpetrators && caseForm.info.perpetrators.length > 0) {
    /*
     * Flatten out the Perpetrator object. This can be changed after this is using the
     * customization framework.
     */
    const thePerp = caseForm.info.perpetrators[0];
    const untypedPerp: any = {
      ...thePerp,
      ...thePerp.perpetrator,
    };
    delete untypedPerp.perpetrator;
    delete untypedPerp.name;
    delete untypedPerp.location;
    perpetrator = {
      ...untypedPerp,
    };
  }
  if (caseForm.info?.incidents && caseForm.info.incidents.length > 0) {
    const theIncident = caseForm.info.incidents[0];
    const untypedIncident: any = {
      ...theIncident,
      ...theIncident.incident,
    };
    delete untypedIncident.incident;
    incident = {
      ...untypedIncident,
    };
  }
  if (caseForm.info?.households && caseForm.info.households.length > 0) {
    // this stores only the first household
    const theHousehold = caseForm.info.households[0];
    const untypedHousehold: any = {
      ...theHousehold,
      ...theHousehold.household,
    };
    delete untypedHousehold.household;
    household = {
      ...untypedHousehold,
    };
  }
  if (caseForm.info?.referrals && caseForm.info.referrals.length > 0) {
    referral = {
      ...caseForm.info.referrals[0],
      date: caseForm.info.referrals[0].date.toString(),
    };
  }

  return {
    topLevel,
    perpetrator,
    incident,
    household,
    referral,
  };
};

const processHelplineConfig = (
  contactForm: ContactRawJson,
  caseForm: Case,
  oneToOneConfigSpec: OneToOneConfigSpec,
): InsightsAttributes => {
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
    formsToProcess.push([oneToOneConfigSpec.caseForm, convertCaseFormForInsights(caseForm)]);
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

  return insightsAtts;
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
  const getProcessedAtts: InsightsUpdateFunction = (attributes, { rawJson }, caseForm) =>
    isNonDataCallType(rawJson.callType)
      ? {}
      : processHelplineConfig(rawJson, caseForm, customConfigObject.oneToOneConfigSpec);

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

    return [
      {
        type: 'VoiceRecording',
        url_provider,
      },
    ];
  } catch (error) {
    console.error('Error generating mediaUrl', error);
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
  caseForm: Case,
  savedContact: Contact,
  externalRecordingInfo: ExternalRecordingInfo | null = null,
) => {
  const previousAttributes = typeof task.attributes === 'string' ? JSON.parse(task.attributes) : task.attributes;

  if (!shouldSendInsightsData(task)) return previousAttributes;

  const { currentDefinitionVersion } = getDefinitionVersions();

  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const finalAttributes: TaskAttributes = getInsightsUpdateFunctionsForConfig(currentDefinitionVersion.insights)
    .map(f => f(previousAttributes, contact, caseForm, savedContact))
    .reduce((acc: TaskAttributes, curr: InsightsAttributes) => mergeAttributes(acc, curr), previousAttributes);

  if (isSuccessfulExternalRecordingInfo(externalRecordingInfo)) {
    const urlProviderBlock = generateUrlProviderBlock(externalRecordingInfo, savedContact);
    finalAttributes.conversations = {
      ...finalAttributes.conversations,
      media: [...(finalAttributes.conversations.media || []), ...urlProviderBlock],
    };
  }

  return finalAttributes;
};
