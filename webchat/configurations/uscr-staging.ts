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

import { Translations, Configuration, MapHelplineLanguage, ContactType } from '../types';
import { PreEngagementFormDefinition, EMAIL_PATTERN } from '../src/pre-engagement-form';

const accountSid = 'AC3edc359b6a45de1a2f6078c7091c8fef';
const flexFlowSid = 'FO3b8f2843b336cbda0225bb38e226bfc0';
const defaultLanguage = 'en-US';
const captureIp = true;
const checkOpenHours = true;
const contactType: ContactType = 'email';

const closedHours: PreEngagementFormDefinition = {
  description: "You've reached CIRCLE outside our webchat hours.",
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description: 'CIRCLE is closed due to a holiday.',
  fields: [],
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'WelcomeMessage',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'checkbox',
      name: 'iAmTrainedBID',
      label:  `I am a trained BID partner`,
      required: {
        value: true,
        message: 'Check the box if you are a trained BID partner.',
      },
    },
    {
      type: 'checkbox',
      name: 'locationWithinServiceArea',
      label:  `Incident location is within the service area. Check <a href="https://lahub.maps.arcgis.com/apps/mapviewer/index.html?webmap=0675f8e77b7149e99f954510d3f6dada">CIRCLE map</a> to confirm.`,
      required: {
        value: true,
        message: 'Confirm that the incident location is within the service area.',
      },
    },
    {
      type: 'select',
      name: 'requestType',
      label: 'Please select your request type',
      defaultValue: 'CIRCLE BID Request',
      required: true,
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "CIRCLE BID Request",
          label: "CIRCLE BID Request"
        },
        {
          value: "City CIRCLE Request",
          label: "City CIRCLE Request"
        }
      ],
    }, 
    {
      type: 'input-text',
      name: 'contactIdentifier',
      label: 'Your email address',
      required: true,
      placeholder: 'Email',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'FieldValidationInvalidEmail',
      },
    },
    {
      type: 'input-text',
      name: 'friendlyName',
      label: 'Your Name',
      placeholder: 'Name',
      required: true,
    },
    {
      type: 'select',
      name: 'bid',
      label: 'Business Improvement District',
      defaultValue: '',
      required: true,
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "The Hollywood Partnership",
          label: "The Hollywood Partnership"
        },
        {
          value: "Other",
          label: "Other"
        }
      ],
    },  
    {
      type: 'input-text',
      name: 'citizenReportingName',
      label: 'Citizen Reporting Name',
      placeholder: 'Citizen Reporting Name',
      required: true,
    },
    {
      type: 'input-text',
      name: 'citizenReportingPhoneNumber',
      label: 'Citizen Reporting Phone Number',
      placeholder: 'Citizen Reporting Phone Number',
      required: true,
    },
    {
      type: 'input-text',
      name: 'operatorId',
      label: 'Operator ID #',
      placeholder: 'Operator ID #',
      required: true,
    },
    {
      type: 'input-text',
      name: 'incidentNumber',
      label: 'Incident #',
      placeholder: 'Incident #',
      required: true,
    },
    {
      type: 'input-text',
      name: 'specificLocation',
      label: 'What is the specific location of the individual or encampment?',
      placeholder: 'What is the specific location of the individual or encampment?',
      required: true,
    },
    {
      type: 'input-text',
      name: 'description',
      label: 'Please provide a description of the encampment or individual(s) and any particular issues/needs and any relevant history or upcoming operations that will impact the location',
      placeholder: 'Please provide a description of the encampment or individual(s) and any particular issues/needs and any relevant history or upcoming operations that will impact the location',
      required: true,
    },
    {
      type: 'input-text',
      name: 'otherOrganizations',
      label: 'Are other outreach organizations currently working with the individual(s)? If so, please provide the organization and a POC',
      placeholder: 'Are other outreach organizations currently working with the individual(s)? If so, please provide the organization and a POC',
      required: false,
    },
    {
      type: 'input-text',
      name: 'additionalDetails',
      label: 'Please provide additional details regarding your request',
      placeholder: 'Please provide additional details regarding your request',
      required: false,
    },
    {
      type: 'input-text',
      name: 'desiredOutcome',
      label: 'What is the desired outcome?',
      placeholder: 'What is the desired outcome?',
      required: true,
    },
    {
      type: 'input-text',
      name: 'priority',
      label: 'Priority',
      placeholder: 'Priority',
      required: false,
    },
  ],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'CIRCLE BID Request',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for an agent.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'CIRCLE is typing',
    StartChat: 'Submit',
    MessageCanvasTrayButton: 'Submit a new request',
    Email: 'Email'
  },
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Helpline Counsellor',
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  switch (helpline) {
    default:
      return defaultLanguage;
  }
};

export const config: Configuration = {
  accountSid,
  flexFlowSid,
  defaultLanguage,
  translations,
  preEngagementConfig,
  closedHours,
  holidayHours,
  checkOpenHours,
  mapHelplineLanguage,
  memberDisplayOptions,
  captureIp,
  contactType,
};
