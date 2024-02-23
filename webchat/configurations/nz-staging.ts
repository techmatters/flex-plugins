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

const accountSid = 'AC3ee873a0431086e5b1166db5f5e29860';
const flexFlowSid = 'FO0a4844fcc193072407dad94b76fcc94d';
const defaultLanguage = 'en-US';
const captureIp = true;
const checkOpenHours = true;
const contactType: ContactType = 'ip';

const closedHours: PreEngagementFormDefinition = {
  description: "We're closed at the moment. Operating hours are 8am-6pm",
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description: 'We are closed because it is a holiday. Please come back tomorrow',
  fields: [],
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'WelcomeMessage',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'input-text',
      name: 'friendlyName',
      label: 'Preferred Name',
      placeholder: 'Name',
      required: true,
    },
    {
      type: 'select',
      name: 'gender',
      label: 'Gender',
      defaultValue: '',
      required: true,
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "Male / Tāne",
          label: "Male / Tāne"
        },
        {
          value: "Female / Wāhine",
          label: "Female / Wāhine"
        },
        {
          value: "Non-binary",
          label: "Non-binary"
        },
        {
          value: "Unknown",
          label: "Prefer not to say"
        }
      ],
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
          value: "Unknown",
          label: "Prefer not to say"
        },
        {
          value: "<13",
          label: "<13"
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
          value: "31-64",
          label: "31-64"
        },
        {
          value: ">64",
          label: ">64"
        }
       ],
     },  
     {
      type: 'select',
      name: 'region',
      label: 'Region',
      defaultValue: '',
      required: true,
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "Unknown",
          label: "Prefer not to say"
        },
        {
          value: "Northland",
          label: "Northland"
        },
        {
          value: "Auckland",
          label: "Auckland"
        },
        {
          value: "Waikato",
          label: "Waikato"
        },
        {
          value: "Bay of Plenty",
          label: "Bay of Plenty"
        },
        {
          value: "Gisborne",
          label: "Gisborne"
        },
        {
          value: "Hawke's Bay",
          label: "Hawke's Bay"
        },
        {
          value: "Taranaki",
          label: "Taranaki"
        },
        {
          value: "Manawatū-Whanganui",
          label: "Manawatū-Whanganui"
        },
        {
          value: "Wellington",
          label: "Wellington"
        },
        {
          value: "Tasman",
          label: "Tasman"
        },
        {
          value: "Nelson",
          label: "Nelson"
        },
        {
          value: "Marlborough",
          label: "Marlborough"
        },
        {
          value: "West Coast",
          label: "West Coast"
        },
        {
          value: "Canterbury",
          label: "Canterbury"
        },
        {
          value: "Otago",
          label: "Otago"
        },
        {
          value: "Southland",
          label: "Southland"
        }
      ],
    },
    {
      label: 'Ethnicity',
      type: 'select',
      name: 'ethnicity',
      required: true,
      defaultValue: '',
       options: [
        {
          value: "",
          label: ""
        },
        {
          value: "Unknown",
          label: "Prefer not to say"
        },
        {
          value: "African",
          label: "African"
        },
        {
          value: "Chinese",
          label: "Chinese"
        },
        {
          value: "Cook Island Māori",
          label: "Cook Island Māori"
        },
        {
          value: "Fijian",
          label: "Fijian"
        },
        {
          value: "Indian",
          label: "Indian"
        },
        {
          value: "Latin American",
          label: "Latin American"
        },
        {
          value: "Māori",
          label: "Māori"
        },
        {
          value: "Middle Eastern",
          label: "Middle Eastern"
        },
        {
          value: "Niuean",
          label: "Niuean"
        },
        {
          value: "NZ European/Pākehā",
          label: "NZ European/Pākehā"
        },
        {
          value: "Other",
          label: "Other"
        },
        {
          value: "Other Asian",
          label: "Other Asian"
        },
        {
          value: "Other European",
          label: "Other European"
        },
        {
          value: "Other Pacific Peoples",
          label: "Other Pacific Peoples"
        },
        {
          value: "Samoan",
          label: "Samoan"
        },
        {
          value: "South-East Asian",
          label: "South-East Asian"
        },
        {
          value: "Tokelauan",
          label: "Tokelauan"
        },
        {
          value: "Tongan",
          label: "Tongan"
        }
       ],
     },
     {
      type: 'select',
      name: 'reason',
      label: 'What kind of support are you looking for?',
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "emergency",
          label: "I’m facing an emergency"
        },
        {
          value: "counselling",
          label: "I’m looking for support"
        },
        {
          value: "Unknown",
          label: "Other"
        }
      ],
    },
    {
      type: 'checkbox',
      name: 'clientPrivacyStatement',
      label: 'I agree with the <a href="https://www.youthline.co.nz/privacy-statement-for-children-and-young-people.html">client privacy statement</a>',
      required: {
        value: true,
        message: 'You need to agree with our client privacy statement to start a chat ',
      },
    },
  ],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to Youthline',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a practitioner.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Youthline is typing',
    StartChat: 'Start Chat!',
    MessageCanvasTrayButton: 'Start New Chat',
    Email: 'Email',
    Age: 'What is your age?',
    Gender: 'What is your gender?',
    Region: 'Select your region',
    Ethnicity: 'Select your ethnicity',
  },
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Helpline Counsellor',
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
