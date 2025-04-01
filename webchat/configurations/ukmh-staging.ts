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
      label: 'On a scale from 0 (not anxious at all) to 10 (completely anxious), how anxious did you feel yesterday?',
      type: 'select',
      name: 'anxietyScale',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: " "
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
        }
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
  mapHelplineLanguage,
  captureIp,
  contactType,
};
