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

const accountSid = 'ACfb0ccf10880289d67f5c4e85ae26402b';
const flexFlowSid = 'FOd69e1f3020fd621d4bd9d4be833d8a19';
const defaultLanguage = 'en-MT';
const captureIp = true;
const contactType: ContactType = 'ip';

const translations: Translations = {
  'en-MT': {
    MessageInputDisabledReasonHold: "We'll transfer you now. Please hold for a professional.",
    EntryPointTagLine: 'Chat with us',
    PreEngagementDescription: "Let's get started",
    Today: 'Today',
    InputPlaceHolder: 'Type Message',
    WelcomeMessage: 'Welcome to Kellimni!',
    Yesterday: 'Yesterday',
    TypingIndicator: 'Professional is typing',
    MessageCanvasTrayButton: 'Start New Chat',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Incoming webchat contact from',
    StartChat: 'Start Chat!',
    Nickname: 'Nickname',
    GuestName: "Guest's name. Please enter only your name.",
  },
  'mt-MT': {
    MessageInputDisabledReasonHold: 'Ha nittrasferuk lil wieħed mis-Professionals tagħna.',
    EntryPointTagLine: 'Chat magħna',
    PreEngagementDescription: 'Ejja nibdew',
    Today: 'Illum',
    InputPlaceHolder: 'Tip Messaġġ',
    WelcomeMessage: 'Merħba lil Kellimni!',
    Yesterday: 'Ilbieraħ',
    TypingIndicator: 'Il Professional qed jittajpja',
    MessageCanvasTrayButton: 'Ibda Chat Ġdida',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Incoming webchat contact from',
    StartChat: 'Ibda Chat!',
    Nickname: 'Laqam',
  },
  'ukr-MT': {
    MessageInputDisabledReasonHold: "Зв'яжемо тебе із нашим консультантом, з яким ти зможеш поговорити.",
    EntryPointTagLine: 'Поспілкуйся з нами в чаті',
    PreEngagementDescription: 'Давайте розпочнемо',
    Today: 'Сьогодні',
    InputPlaceHolder: 'Введіть повідомлення',
    WelcomeMessage: 'Привіт, це Блакитна Лінія!',
    Yesterday: 'вчора',
    TypingIndicator: 'набір тексту...',
    MessageCanvasTrayButton: 'Почати чат',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Вхідний чат',
    StartChat: 'Почати чат!',
    Nickname: 'нікнейм',
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
      placeholder: 'GuestName',
      required: true,
    },
    {
      label: 'Age/Età/літа',
      type: 'select',
      name: 'ageRange',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: ">=16",
          label: ">=16"
        },
        {
          value: "<16",
          label: "<16"
        }
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'I\'ve read and accept the <a href="https://kellimni.com/chat-terms/">Terms and Conditions</a>',
      required: {
        value: true,
        message: "Sorry, if you don't accept our terms and conditions we can't provide counselling to you.",
      }, 
    },
  ],
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Professional',
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
  memberDisplayOptions,
  captureIp,
  contactType,
};
