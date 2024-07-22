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

const accountSid = 'ACa00e3e32f7ba405cc0f5906906d88e97';
const flexFlowSid = 'FO468b62cdd84da623f50059a50f01ff92';
const defaultLanguage = 'en-SG';
const captureIp = true;
const checkOpenHours = true;
const contactType: ContactType = 'ip';

const closedHours: PreEngagementFormDefinition = {
  description: "We're closed at the moment. Operating hours are 2:30pm-7pm",
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
      name: 'firstName',
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
          value: "Male",
          label: "Male"
        },
        {
          value: "Female",
          label: "Female"
        },
        {
          value: "Other",
          label: "Other"
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
          value: ">20",
          label: "21 and above"
        }
      ],
    },
    {
      type: 'input-text',
      name: 'email',
      label: 'Email Address',
      placeholder: 'Email Address',
    },
    {
      type: 'input-text',
      name: 'contactNumber',
      label: 'Contact Number',
      placeholder: 'Contact No',
    },
    {
      label: 'What would you like to talk about?',
      type: 'select',
      name: 'reason',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "school",
          label: "School"
        },
        {
          value: "friendship",
          label: "Friendship"
        },
        {
          value: "family",
          label: "Family"
        },
        {
          value: "mentalHealth",
          label: "Mental Health"
        },
        {
          value: "unsafe",
          label: "Feelings of Being Unsafe"
        },
        {
          value: "nothing",
          label: "Nothing"
        },
        {
          value: "more",
          label: "More than one of the above"
        },
        {
          value: "other",
          label: "Other"
        },
        {
          value: "Unknown",
          label: "Unknown"
        }
      ],
    },
    {
      label: 'How did you hear about Tinkle Friend?',
      type: 'select',
      name: 'howDidYouHearAboutUs',
      required: true,
      defaultValue: '',
      options: [
        {
          value: "",
          label: ""
        },
        {
          value: "eAssemblyTalk",
          label: "E-assembly talk"
        },
        {
          value: "school",
          label: "School - Tinkle Friend Poster / Student Handbook"
        },
        {
          value: "familyFriend",
          label: "Family / Friend"
        },
        {
          value: "teacherCounsellor",
          label: "Teacher/ school counsellor"
        },
        {
          value: "news",
          label: "News article"
        },
        {
          value: "other",
          label: "Other"
        }
      ],
    },
    {
      type: 'checkbox',
      name: 'clientPrivacyStatement',
      label: 'I agree with the <a href="https://tinklefriend.sg/terms">Terms of Use</a>',
      required: {
        value: true,
        message: 'You need to agree with our terms of use to start a chat ',
      },
    },
  ],
};

const translations: Translations = {
  'en-SG': {
    WelcomeMessage: 'Welcome to Tinkle Friend',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a Tinkle Friend.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Tinkle Friend is typing',
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
  theirDefaultName: 'Tinkle Friend',
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
