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
import { EMAIL_PATTERN, PreEngagementFormDefinition } from '../src/pre-engagement-form';

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
      label: 'Name (and pronouns)',
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
          value: "25",
          label: "25"
        },
        {
          value: ">25 (Adult)",
          label: ">25 (Adult)"
        }
      ],
    },
    {
      type: 'input-text',
      name: 'personalEmail',
      label: 'Email Address',
      required: true,
      placeholder: 'Email Address',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'Please enter valid email address',
      },
    },
    {
      type: 'input-text',
      name: 'howDidYouHearAboutWhatsUp',
      label: "How did you hear about What's Up?",
    },
    {
      label: 'What would you like to talk about?',
      type: 'select',
      name: 'topic',
      required: true,
      defaultValue: '',
      options: [
        { value: "", label: "" }, 
        { value: "I just want to talk", label: "I just want to talk" }, 
        { value: "I'm angry", label: "I'm angry" }, 
        { value: "I'm ashamed", label: "I'm ashamed" }, 
        { value: "I'm happy", label: "I'm happy" }, 
        { value: "I'm lonely", label: "I'm lonely" }, 
        { value: "I'm sad", label: "I'm sad" }, 
        { value: "I'm scared", label: "I'm scared" }, 
        { value: "I'm thinking about suicide", label: "I'm thinking about suicide" }, 
        { value: "I'm unsafe", label: "I'm unsafe" }, 
        { value: "I'm worried", label: "I'm worried" }, 
        { value: "Something in the News", label: "Something in the News" }, 
        { value: "Unsure", label: "Unsure" }
      ],
    },
    {
      label: 'What is your Ethnicity/cultural background?',
      type: 'select',
      name: 'ethnicity1',
      required: true,
      defaultValue: '',
      options: [
        { value: "", label: "" }, { value: "European (Unspecified)", label: "European (Unspecified)" }, { value: "New Zealand European", label: "New Zealand European" }, { value: "British and Irish", label: "British and Irish" }, { value: "Dutch", label: "Dutch" }, { value: "Greek", label: "Greek" }, { value: "Polish", label: "Polish" }, { value: "South Slav", label: "South Slav" }, { value: "Italian", label: "Italian" }, { value: "German", label: "German" }, { value: "Australian", label: "Australian" }, { value: "Other European", label: "Other European" }, { value: "Māori", label: "Māori" }, { value: "Pacific Peoples (unspecified)", label: "Pacific Peoples (unspecified)" }, { value: "Samoan", label: "Samoan" }, { value: "Cook Islands Maori", label: "Cook Islands Maori" }, { value: "Tongan", label: "Tongan" }, { value: "Niuean", label: "Niuean" }, { value: "Tokelauan", label: "Tokelauan" }, { value: "Fijian", label: "Fijian" }, { value: "French Polynesian", label: "French Polynesian" }, { value: "Indigenous Australian", label: "Indigenous Australian" }, { value: "Kiribati", label: "Kiribati" }, { value: "Micronesian", label: "Micronesian" }, { value: "Papua New Guinea", label: "Papua New Guinea" }, { value: "Solomon Islander", label: "Solomon Islander" }, { value: "Tuvalu Islander", label: "Tuvalu Islander" }, { value: "Other Pacific Peoples", label: "Other Pacific Peoples" }, { value: "Asian (unspecified)", label: "Asian (unspecified)" }, { value: "Southeast Asian (unspecified)", label: "Southeast Asian (unspecified)" }, { value: "Filipino", label: "Filipino" }, { value: "Cambodian", label: "Cambodian" }, { value: "Vietnamese", label: "Vietnamese" }, { value: "Other Southeast Asian", label: "Other Southeast Asian" }, { value: "Chinese", label: "Chinese" }, { value: "Indian", label: "Indian" }, { value: "Sri Lankan", label: "Sri Lankan" }, { value: "Japanese", label: "Japanese" }, { value: "Korean", label: "Korean" }, { value: "Other Asian", label: "Other Asian" }, { value: "Middle Eastern", label: "Middle Eastern" }, { value: "Latin American", label: "Latin American" }, { value: "African", label: "African" }, { value: "Indian Ocean Peoples", label: "Indian Ocean Peoples" }, { value: "Indigenous American", label: "Indigenous American" }, { value: "Other Ethnicity", label: "Other Ethnicity" }, { value: "Not Stated", label: "Not Stated" }
      ],
    },
    {
      type: 'input-text',
      name: 'feelingRightNow',
      label: 'How are you feeling right now? (0 = calm / okay → 10 = extremely upset or distressed)',
    },
    {
      label: 'In the past year, have you been on a waitlist for 1 month or longer for professional mental health services?',
      type: 'select',
      name: 'onWaitinglist',
      required: true,
      defaultValue: '',
      options: [
        { value: "", label: "" }, 
        { value: "Yes", label: "Yes" }, 
        { value: "No", label: "No" }
      ],
    },
    {
      label: 'Is this the first time you have chatted with us?',
      type: 'select',
      name: 'firstTime',
      required: true,
      defaultValue: '',
      options: [
        { value: "", label: "" }, 
        { value: "Yes", label: "Yes" }, 
        { value: "No", label: "No" }
      ],
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
