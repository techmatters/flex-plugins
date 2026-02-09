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
import type { PreEngagementFormDefinition } from '../src/pre-engagement-form';

const accountSid = 'AC574591f522bc6e981aea7d34fb14fa5e';
const flexFlowSid = 'FO72895d84c5d2136ef19d0afc50a59f39';
const defaultLanguage = 'en-NZ';
const captureIp = true;
const contactType: ContactType = 'ip';

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Barnardos Aotearoa',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a counsellor.",
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription:
      'Thank you for contacting Barnardos Aotearoa. To chat with a counsellor, please type your name and select the Start Chat button.',
    WhatIsYourName: 'What is your name?',
    StartChat: 'Start Chat!',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'Let us chat',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'input-text',
      name: 'firstName',
      label: 'First Name',
      required: true,
    },
    {
      label: 'Age',
      type: 'select',
      name: 'age',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "Unborn",
          label: "Unborn"
        },
        {
          value: "00",
          label: "0"
        },
        {
          value: "01",
          label: "1"
        },
        {
          value: "02",
          label: "2"
        },
        {
          value: "03",
          label: "3"
        },
        {
          value: "04",
          label: "4"
        },
        {
          value: "05",
          label: "5"
        },
        {
          value: "06",
          label: "6"
        },
        {
          value: "07",
          label: "7"
        },
        {
          value: "08",
          label: "8"
        },
        {
          value: "09",
          label: "9"
        },
        {
          value: "10",
          label: "10"
        },
        {
          value: "11",
          label: "11"
        },
        {
          value: "12",
          label: "12"
        },
        {
          value: "13",
          label: "13"
        },
        {
          value: "14",
          label: "14"
        },
        {
          value: "15",
          label: "15"
        },
        {
          value: "16",
          label: "16"
        },
        {
          value: "17",
          label: "17"
        },
        {
          value: "18",
          label: "18"
        },
        {
          value: "19",
          label: "19"
        },
        {
          value: "20",
          label: "20"
        },
        {
          value: "21",
          label: "21"
        },
        {
          value: "22",
          label: "22"
        },
        {
          value: "23",
          label: "23"
        },
        {
          value: "24",
          label: "24"
        },
        {
          value: ">25",
          label: ">25"
        },
        {
          value: "Unknown",
          label: "Unknown"
        }
      ],
    },
    {
      label: 'Gender',
      type: 'select',
      name: 'gender',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: 'Girl',
          label: 'Girl',
        },
        {
          value: 'Boy',
          label: 'Boy',
        },
        {
          value: 'Non-Binary',
          label: 'Non-Binary',
        },
        {
          value: 'Unknown',
          label: 'Unknown',
        },
      ],
    },
    {
      type: 'select',
      name: 'province',
      label: 'Province',
      required: false,
      defaultValue: '',
      options: [
        { 'value': '', 'label': '' },
        { 'value': 'Northern', 'label': 'Northern' },
        { 'value': 'Eastern', 'label': 'Eastern' },
        { 'value': 'Western', 'label': 'Western' },
        { 'value': 'Southern', 'label': 'Southern' },
        { 'value': 'Unknown', 'label': 'Unknown'}
      ],
    },
    {
      name: 'district',
      label: 'District',
      type: 'dependent-select',
      dependsOn: 'province',
      required: false,
      options: {
       'Northern': [
        { 'value': 'District A', 'label': 'District A' },
        { 'value': 'District B', 'label': 'District B' },
        { 'value': 'District C', 'label': 'District C' },
        { 'value': 'Unknown', 'label': 'Unknown'}
      ],
      'Eastern': [
        { 'value': 'District A', 'label': 'District A' },
        { 'value': 'District B', 'label': 'District B' },
        { 'value': 'District C', 'label': 'District C' },
        { 'value': 'Unknown', 'label': 'Unknown'}
      ],
      'Western': [
        { 'value': 'District A', 'label': 'District A' },
        { 'value': 'District B', 'label': 'District B' },
        { 'value': 'District C', 'label': 'District C' },
        { 'value': 'Unknown', 'label': 'Unknown'}
      ],
      'Southern': [
        { 'value': 'District A', 'label': 'District A' },
        { 'value': 'District B', 'label': 'District B' },
        { 'value': 'District C', 'label': 'District C' },
        { 'value': 'Unknown', 'label': 'Unknown'}
      ]
      },
    },
    {
      label: 'How urgent is your situation?',
      type: 'select',
      name: 'urgencyLevel',
      required: false,
      defaultValue: '',
      options: [
        { 'value': '', 'label': '' },
        { 'value': 'Urgent', 'label': 'Urgent' },
        { 'value': 'Critical', 'label': 'Critical' },
        { 'value': 'Non-critical', 'label': 'Non-critical' },
        { 'value': 'Other', 'label': 'Other' }
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'I\'ve read and accept the <a href="https://en.wikipedia.org/wiki/Terms_of_service">Terms and Conditions</a>',
      required: {
        value: true,
        message: "Sorry, if you don't accept our terms and conditions we can't provide counselling to you.",
      }, 
    },
   
  ],
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (helpline) {
    default:
      return defaultLanguage;
  }
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Barnardos Aotearoa Counsellor',
};

export const config: Configuration = {
  accountSid,
  flexFlowSid,
  defaultLanguage,
  translations,
  preEngagementConfig,
  mapHelplineLanguage,
  memberDisplayOptions,
  captureIp,
  contactType,
  twilioServicesUrl: new URL(`https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
