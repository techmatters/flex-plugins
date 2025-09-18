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

const accountSid = 'AC9eb11b6c714d785db648b6ea6a85c13f';
const flexFlowSid = 'FO3bce9ff5450d3630078145e245b127eb';
const defaultLanguage = 'en-GB';
const captureIp = true;
const contactType: ContactType = 'email';

const translations: Translations = {
  'en-GB': {
    WelcomeMessage: 'Welcome to The Mix Peer Chat Service',
    EntryPointTagLine: 'The Mix Peer Chat Service',
    TypingIndicator: 'Peer Supporter is typing',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold: 'Please hold for a Peer Supporter.',
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription: `Let's get started`,
    LetsChat: "Let's chat!",
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'LetsChat',
  fields: [
    {
      type: 'input-text',
      name: 'friendlyName',
      label: 'First Name',
      placeholder: 'Your name',
      required: true,
    },
    {
      type: 'input-text',
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Your last name',
      required: true,
    },
    {
      type: 'input-text',
      name: 'contactIdentifier',
      label: 'Email Address',
      required: true,
      placeholder: 'Your Email',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'Please enter valid email address',
      },
    },
    {
      type: 'input-text',
      name: 'phone1',
      label: 'Phone Number',
      placeholder: 'Your phone number',
      required: true,
    },
    {
      type: 'input-text',
      name: 'bookingReference',
      label: 'Booking Reference',
      required: true,
    },
    {
      label: 'On a scale from 0 (not anxious at all) to 10 (completely anxious), how anxious did you feel yesterday?',
      type: 'select',
      name: 'anxietyScale',
      required: true,
      options: [
        {
          "value": "Unknown",
          "label": ""
        },
        {
          "value": "00",
          "label": "0"
        },
        {
          "value": "01",
          "label": "1"
        },
        {
          "value": "02",
          "label": "2"
        },
        {
          "value": "03",
          "label": "3"
        },
        {
          "value": "04",
          "label": "4"
        },
        {
          "value": "05",
          "label": "5"
        },
        {
          "value": "06",
          "label": "6"
        },
        {
          "value": "07",
          "label": "7"
        },
        {
          "value": "08",
          "label": "8"
        },
        {
          "value": "09",
          "label": "9"
        },
        {
          "value": "10",
          "label": "10"
        }
      ],
    },
    {
      label: 'On a scale from 1 (sad) to 5 (happy), what mood are in currently?',
      type: 'select',
      name: 'moodhappinessBefore',
      required: true,
      options: [
        {
          "value": "Unknown",
          "label": ""
        },
        {
          "value": "01",
          "label": "☹️ 1"
        },
        {
          "value": "02",
          "label": "🙁 2"
        },
        {
          "value": "03",
          "label": "😐 3"
        },
        {
          "value": "04",
          "label": "🙂 4"
        },
        {
          "value": "05",
          "label": "😀 5"
        }
      ],
    },
    {
      type: 'select',
      name: 'consentForResearchEvaluation',
      label:
        'I consent to being contacted for research or evaluation purposes.',
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: 'Yes',
          label: 'Yes',
        },
        {
          value: 'No',
          label: 'No',
        },
      ],
      required: {
        value: true,
        message: "Sorry, you need to select one of the options",
      },
    },
    {
      type: 'select',
      name: 'dataProcessingAndStorage',
      label:
        'I consent to my data being processed and stored in order to access the Peer Support service.',
        defaultValue: '',
        options: [
          {
            value: "",
            label: ""
          },
          {
            value: 'Yes',
            label: 'Yes',
          },
          {
            value: 'No',
            label: 'No',
          },
        ],
      required: {
        value: true,
        message: "Sorry, if you don't consent to have your data being processed and stored we can't provide counselling to you.",
      },
    },
    {
      type: 'select',
      name: 'termsAndConditions',
      label:
        'I have read terms of use and the <a href="https://www.themix.org.uk/about-us/privacy-centre/privacy-policy/">privacy policy</a> and agree to them.',
        defaultValue: '',
        options: [
          {
            value: "",
            label: ""
          },
          {
            value: 'Yes',
            label: 'Yes',
          },
          {
            value: 'No',
            label: 'No',
          },
        ],
      required: {
        value: true,
        message: "Sorry, if you don't accept our terms and privacy policy we can't provide counselling to you.",
      },
    },
  ],
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  switch (helpline) {
    default:
      return defaultLanguage;
  }
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'The Mix Peer Supporter',
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
};
