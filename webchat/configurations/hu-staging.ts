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

const accountSid = 'ACbdbee34ef7d099e71cf095d540ff3270';
const flexFlowSid = 'FO9d20dbe99abbc3b9ad7709f961b0fe95';
const defaultLanguage = 'ukr-HU';
const captureIp = false;
const checkOpenHours = false;
const contactType: ContactType = 'ip';

const translations: Translations = {
  'en-US': {
    MessageInputDisabledReasonHold: "We'll transfer you now. Please hold for a counsellor.",
    EntryPointTagLine: 'Chat with us',
    PreEngagementDescription: "Let's get started",
    Today: 'Today',
    InputPlaceHolder: 'Type Message',
    WelcomeMessage: 'Welcome to Kék Vonal!',
    Yesterday: 'Yesterday',
    TypingIndicator: 'Counselor is typing',
    MessageCanvasTrayButton: 'Start New Chat',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Incoming webchat contact from',
    StartChat: 'Start Chat!',
  },
  'hu-HU': {
    MessageInputDisabledReasonHold: 'Továbbítunk egy ügyelőhöz, akivel beszélgetni tudsz.',
    EntryPointTagLine: 'Csetelj velünk',
    PreEngagementDescription: '',
    Today: 'Ma',
    InputPlaceHolder: 'Taipeni ilyashi',
    WelcomeMessage: 'Szia, ez itt a Kék Vonal!',
    Yesterday: 'Tegnap',
    TypingIndicator: 'gépelés...',
    MessageCanvasTrayButton: 'Chat indítása',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Bejövő chat',
    StartChat: 'Chat indítása!',
  },
  'ukr-HU': {
    MessageInputDisabledReasonHold: "Зв'яжемо тебе із нашим консультантом, з яким ти зможеш поговорити.",
    EntryPointTagLine: 'Поспілкуйся з нами в чаті',
    PreEngagementDescription: '',
    Today: 'Сьогодні',
    Language: 'Мова',
    InputPlaceHolder: 'Введіть повідомлення',
    WelcomeMessage: 'Привіт, це Kék Vonal!',
    Yesterday: 'вчора',
    TypingIndicator: 'набір тексту...',
    MessageCanvasTrayButton: 'Почати чат',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Вхідний чат',
    StartChat: 'Почати чат!',
  },
  'ru-HU': {
    MessageInputDisabledReasonHold: 'Свяжем тебя с нашим консультантом, с которым ты сможешь поговорить.',
    EntryPointTagLine: 'Пообщайся с нами в чате',
    PreEngagementDescription: 'Давайте начнем',
    Today: 'Сегодня',
    InputPlaceHolder: 'Введите сообщение',
    WelcomeMessage: 'Привет, это Kék Vonal!',
    Yesterday: 'Вчерашний день',
    TypingIndicator: 'набор текста...',
    MessageCanvasTrayButton: 'Привет, это Синяя Линия!',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: 'Входящий чат',
    StartChat: 'Начать чат!',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: '',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'select',
      name: 'language',
      label: 'Language',
      defaultValue: 'ukr-HU',
      required: true,
      options: [
        { value: 'ukr-HU', label: 'Українська' },
        { value: 'ru-HU', label: 'Русский' },
      ],
    },
  ],
};

const closedHours: PreEngagementFormDefinition = {
  description:
    'Привіт, це Kék Vonal. Наразі усі наші оператори зайняті. Спілкуватися українською чи російською мовами ти можеш у вівторок і четвер з 16:00 до 20:00. Чекаємо твого дзвінка! \n\nПривет, это Kék Vonal. На данный момент все наши операторы заняты. Общаться на украинском или русском языке ты можешь во вторник и четверг с 16:00 до 20:00. Ждем твоего звонка!',
  fields: [],
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
  theirDefaultName: 'Kék Vonal',
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
  checkOpenHours,
  closedHours,
  contactType,
  twilioServicesUrl: new URL(`https://hrm-staging-eu.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
