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

const accountSid = 'AC94cb43c61dbc082094fb34cb147896eb';
const flexFlowSid = 'FO084c309dc82e2f95ba95eaba50cfd756';
const defaultLanguage = 'en-US';
const captureIp = true;
const contactType: ContactType = 'ip';

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'National Child Helpline (116)',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a counsellor.",
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription:
      'Thank you for contacting National Child Helpline (116). To chat with a counsellor, please type your name and select the Start Chat button.',
    WhatIsYourName: 'What is your name?',
    StartChat: 'Start Chat!',
    SelectLanguage: 'Select your language',
  },
  "sw_TZ": {
    WelcomeMessage: "National Child Helpline (116)",
    MessageCanvasTrayContent: "",
    MessageInputDisabledReasonHold:
      "Asante sana kwa maelezo haya. Tutakuunganisha sasa. Tafadhali subiri ili kuzungumza na mshauri.",
    AutoFirstMessage: "Mawasiliano ya gumzo la wavuti yanayoingia kutoka",
    PreEngagementDescription:
      "Asante kwa kuwasiliana na National Child Helpline (116). Ili kuzungumza na mshauri, tafadhali andika jina lako na bonyeza kitufe cha Anza Gumzo.",
    WhatIsYourName: "Jina lako ni nani?",
    StartChat: "Anza Gumzo!",
    SelectLanguage: "Chagua lugha yako"
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'input-text',
      name: 'friendlyName',
      label: 'Name/Jina',
      placeholder: 'What is your name?/Jina lako ni nani?',
      required: true,
    },
    {
      type: 'select',
      name: 'language',
      label: 'Select Language/Chagua lugha',
      required: true,
      options: [
        {
          value: '',
          label: ''
        },
        { value: 'en-US', label: 'English' },
        { value: 'sw_TZ', label: 'Kiswahili' },
      ],
    },
    {
      type: 'select',
      name: 'area',
      label: 'Select Location/Chagua maeneo',
      required: true,
      options: [
        {
          value: '',
          label: ''
        },
        { value: 'Main Land', 
          label: 'Tanzania - Main Land' 
        },
        { value: 'Zanzibar/Pemba', 
          label: 'Zanzibar/Pemba' 
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'I agree with the <a href="https://www.sematanzania.org/child-helpline">Terms of Use</a>',
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
    case '2. Kiswahili':
      return 'sw_TZ';
    default:
      return defaultLanguage;
  }
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'National Child Helpline Counsellor',
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
