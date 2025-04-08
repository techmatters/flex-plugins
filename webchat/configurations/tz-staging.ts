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
    WelcomeMessage: 'C-Sema',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a counsellor.",
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription:
      'Thank you for contacting C-Sema. To chat with a counsellor, please type your name and select the Start Chat button.',
    WhatIsYourName: 'What is your name?',
    StartChat: 'Start Chat!',
    SelectLanguage: 'Select your language',
  },
  "Swahili": {
    WelcomeMessage: "C-Sema",
    MessageCanvasTrayContent: "",
    MessageInputDisabledReasonHold:
      "Asante sana kwa maelezo haya. Tutakuunganisha sasa. Tafadhali subiri ili kuzungumza na mshauri.",
    AutoFirstMessage: "Mawasiliano ya gumzo la wavuti yanayoingia kutoka",
    PreEngagementDescription:
      "Asante kwa kuwasiliana na C-Sema. Ili kuzungumza na mshauri, tafadhali andika jina lako na bonyeza kitufe cha Anza Gumzo.",
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
      label: 'Nickname',
      placeholder: 'Nickname',
      required: true,
    },
    {
      type: 'select',
      name: 'language',
      label: 'Select Language',
      defaultValue: 'en-US',
      required: true,
      options: [
        { value: 'en-US', label: '1. English' },
        { value: 'Swahili', label: '2. Kiswahili' },
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'I agree with the <a href="https://www.sematanzania.org/child-helpline">Terms of Use</a>',
      required: {
        value: true,
        message: '<message>',
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
  theirDefaultName: 'C-Sema Counsellor',
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
