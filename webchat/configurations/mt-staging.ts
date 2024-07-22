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
      type: 'select',
      name: 'language',
      label: 'Select your language',
      defaultValue: '',
      required: true,
      options: [
        { value: '', label: '' },
        { value: 'en-MT', label: 'English' },
        { value: 'mt-MT', label: 'Maltese' },
        { value: 'ukr-MT', label: 'Ukrainian' },
      ],
    },
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
      name: 'age',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
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
          value: "25",
          label: "25"
        },
        {
          value: "26",
          label: "26"
        },
        {
          value: "27",
          label: "27"
        },
        {
          value: "28",
          label: "28"
        },
        {
          value: "29",
          label: "29"
        },
        {
          value: "30",
          label: "30"
        },
        {
          value: "31",
          label: "31"
        },
        {
          value: "32",
          label: "32"
        },
        {
          value: "33",
          label: "33"
        },
        {
          value: "34",
          label: "34"
        },
        {
          value: "35",
          label: "35"
        },
        {
          value: "36",
          label: "36"
        },
        {
          value: "37",
          label: "37"
        },
        {
          value: "38",
          label: "38"
        },
        {
          value: "39",
          label: "39"
        },
        {
          value: "40",
          label: "40"
        },
        {
          value: "41",
          label: "41"
        },
        {
          value: "42",
          label: "42"
        },
        {
          value: "43",
          label: "43"
        },
        {
          value: "44",
          label: "44"
        },
        {
          value: "45",
          label: "45"
        },
        {
          value: "46",
          label: "46"
        },
        {
          value: "47",
          label: "47"
        },
        {
          value: "48",
          label: "48"
        },
        {
          value: "49",
          label: "49"
        },
        {
          value: "50",
          label: "50"
        },
        {
          value: "51",
          label: "51"
        },
        {
          value: "52",
          label: "52"
        },
        {
          value: "53",
          label: "53"
        },
        {
          value: "54",
          label: "54"
        },
        {
          value: "55",
          label: "55"
        },
        {
          value: "56",
          label: "56"
        },
        {
          value: "57",
          label: "57"
        },
        {
          value: "58",
          label: "58"
        },
        {
          value: "59",
          label: "59"
        },
        {
          value: "60",
          label: "60"
        },
        {
          value: "61",
          label: "61"
        },
        {
          value: "62",
          label: "62"
        },
        {
          value: "63",
          label: "63"
        },
        {
          value: "64",
          label: "64"
        },
        {
          value: "65",
          label: "65"
        },
        {
          value: "66",
          label: "66"
        },
        {
          value: "67",
          label: "67"
        },
        {
          value: "68",
          label: "68"
        },
        {
          value: "69",
          label: "69"
        },
        {
          value: "70",
          label: "70"
        },
        {
          value: ">70",
          label: ">70"
        },
        {
          value: "Unknown",
          label: "Rather not say"
        },
      ],
    },
    {
      label: 'Gender/Sess/Стать',
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
          value: 'Female',
          label: 'Female/Mara/Жінка',
        },
        {
          value: 'Male',
          label: 'Male/Raġel/Чоловік',
        },
        {
          value: 'Other',
          label: 'Others/Oħrajn/Інші',
        },
        {
          value: 'Unknown',
          label: 'Rather not say/Ma nixtieqx naghti risposta/Не хочу відповідати',
        },
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
