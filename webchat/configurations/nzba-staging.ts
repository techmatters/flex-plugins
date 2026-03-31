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
const defaultLanguage = 'en-US';
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
      name: "ethnicity1",
      label: "Ethnicity",
      type: "select",
      isPII: false,
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "European (Unspecified)",
          label: "European (Unspecified)"
        },
        {
          value: "New Zealand European",
          label: "New Zealand European"
        },
        {
          value: "British and Irish",
          label: "British and Irish"
        },
        {
          value: "Dutch",
          label: "Dutch"
        },
        {
          value: "Greek",
          label: "Greek"
        },
        {
          value: "Polish",
          label: "Polish"
        },
        {
          value: "South Slav",
          label: "South Slav"
        },
        {
          value: "Italian",
          label: "Italian"
        },
        {
          value: "German",
          label: "German"
        },
        {
          value: "Australian",
          label: "Australian"
        },
        {
          value: "Other European",
          label: "Other European"
        },
        {
          value: "Māori",
          label: "Māori"
        },
        {
          value: "Pacific Peoples (unspecified)",
          label: "Pacific Peoples (unspecified)"
        },
        {
          value: "Samoan",
          label: "Samoan"
        },
        {
          value: "Cook Islands Maori",
          label: "Cook Islands Maori"
        },
        {
          value: "Tongan",
          label: "Tongan"
        },
        {
          value: "Niuean",
          label: "Niuean"
        },
        {
          value: "Tokelauan",
          label: "Tokelauan"
        },
        {
          value: "Fijian",
          label: "Fijian"
        },
        {
          value: "French Polynesian",
          label: "French Polynesian"
        },
        {
          value: "Indigenous Australian",
          label: "Indigenous Australian"
        },
        {
          value: "Kiribati",
          label: "Kiribati"
        },
        {
          value: "Micronesian",
          label: "Micronesian"
        },
        {
          value: "Papua New Guinea",
          label: "Papua New Guinea"
        },
        {
          value: "Solomon Islander",
          label: "Solomon Islander"
        },
        {
          value: "Tuvalu Islander",
          label: "Tuvalu Islander"
        },
        {
          value: "Other Pacific Peoples",
          label: "Other Pacific Peoples"
        },
        {
          value: "Asian (unspecified)",
          label: "Asian (unspecified)"
        },
        {
          value: "Southeast Asian (unspecified)",
          label: "Southeast Asian (unspecified)"
        },
        {
          value: "Filipino",
          label: "Filipino"
        },
        {
          value: "Cambodian",
          label: "Cambodian"
        },
        {
          value: "Vietnamese",
          label: "Vietnamese"
        },
        {
          value: "Other Southeast Asian",
          label: "Other Southeast Asian"
        },
        {
          value: "Chinese",
          label: "Chinese"
        },
        {
          value: "Indian",
          label: "Indian"
        },
        {
          value: "Sri Lankan",
          label: "Sri Lankan"
        },
        {
          value: "Japanese",
          label: "Japanese"
        },
        {
          value: "Korean",
          label: "Korean"
        },
        {
          value: "Other Asian",
          label: "Other Asian"
        },
        {
          value: "Middle Eastern",
          label: "Middle Eastern"
        },
        {
          value: "Latin American",
          label: "Latin American"
        },
        {
          value: "African",
          label: "African"
        },
        {
          value: "Indian Ocean Peoples",
          label: "Indian Ocean Peoples"
        },
        {
          value: "Indigenous American",
          label: "Indigenous American"
        },
        {
          value: "Other Ethnicity",
          label: "Other Ethnicity"
        },
        {
          value: "Not Stated",
          label: "Not Stated"
        }
      ],
      required: {
        value: true,
        message: "RequiredFieldError"
      }
    },
    {
      label: 'Is this your first contact?',
      type: 'select',
      name: 'firstContact',
      required: false,
      defaultValue: '',
      options: [
        { value: '', label: '' },
        { value: 'Yes', label: 'Yes' },
        { value: 'No', label: 'No' }
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
