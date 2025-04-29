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
      label:  'I am an authorized CIRCLE requestor',
      required: {
        value: true,
        message: 'Check the box if you are an authorized user.',
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
      type: 'input-text',
      name: 'phone',
      label: 'Phone Number for Callback',
      placeholder: 'Phone Number',
      required: true,
    },
    {
      type: 'select',
      name: 'officeDepartmentBid',
      label: 'Your Office/Department or BID',
      defaultValue: '',
      required: true,
      options: [
        {
          "label": "",
          "value": ""
        },
        {
          "label": "CAO",
          "value": "cao_office_dept"
        },
        {
          "label": "LAPD",
          "value": "lapd_office_dept"
        },
        {
          "label": "CD1",
          "value": "cd1_office_dept"
        },
        {
          "label": "CD4",
          "value": "cd4_office_dept"
        },
        {
          "label": "CD5",
          "value": "cd5_office_dept"
        },
        {
          "label": "CD6",
          "value": "cd6_office_dept"
        },
        {
          "label": "CD7",
          "value": "cd7_office_dept"
        },
        {
          "label": "CD8",
          "value": "cd8_office_dept"
        },
        {
          "label": "CD9",
          "value": "cd9_office_dept"
        },
        {
          "label": "CD10",
          "value": "cd10_office_dept"
        },
        {
          "label": "CD11",
          "value": "cd11_office_dept"
        },
        {
          "label": "CD13",
          "value": "cd13_office_dept"
        },
        {
          "label": "CD14",
          "value": "cd14_office_dept"
        },
        {
          "label": "CD15",
          "value": "cd15_office_dept"
        },
        {
          "label": "Mayor's Office",
          "value": "mayor_s_office_dept"
        },
        {
          value: "BID",
          label: "BID"
        },
        {
          value: "Other",
          label: "Other"
        },
      ],
    },
    {
      type: 'input-text',
      name: 'otherBID',
      label: 'If BID/Other, please specify:',
      placeholder: '',
    },
    {
      type: 'checkbox',
      name: 'firsthandWitness',
      label:  `To ensure the incident is appropriate and safe for unarmed responders, verify that you or a representative of your team are witnessing the incident firsthand`,
      required: {
        value: true,
        message: 'Please verify that you or a representative of your team are witnessing the incident firsthand',
      },
    },
    {
      type: 'input-text',
      name: 'specificLocation',
      label: 'What is the specific location of the individual or encampment?',
      placeholder: 'Specific location',
      required: true,
    },
    {
      type: 'input-text',
      name: 'incidentSummary',
      label: 'Please provide a description of the situation, encampment, or individual(s) and any particular issues/needs and any relevant history or upcoming operations that will impact the location',
      placeholder: 'Please provide a description',
      required: true,
    }, 
  ],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'CIRCLE BID Request',
    EntryPointTagline: 'Submit a request',
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
  theirDefaultName: 'CIRCLE Operator',
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
