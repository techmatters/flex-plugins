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
import { PreEngagementFormDefinition } from '../src/pre-engagement-form';

const accountSid = 'AC147e360e21386797593c3893bf4def12';
const flexFlowSid = 'FO464be1805424c9a42a90a88e53cc0ed0';
const defaultLanguage = 'en-US';
const captureIp = true;
const checkOpenHours = false;
const contactType: ContactType = 'ip';

const closedHours: PreEngagementFormDefinition = {
  description:
    'Closed offices message',
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description:
    'Closed holidays message',
  fields: [],
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'WelcomeMessage',
  submitLabel: 'StartChat',
  fields: [
    {
      label: 'How old are you?',
      type: 'select',
      name: 'age',
      required: true,
      defaultValue: '',
      options: [
        {
          "value": "",
          "label": ""
        },
        {
          "value": "0-5",
          "label": "0-5"
        },
        {
          "value": "6-12",
          "label": "6-12"
        },
        {
          "value": "13-17",
          "label": "13-17"
        },
        {
          "value": "18-24",
          "label": "18-24"
        },
        {
          "value": "Adult 25+",
          "label": "Adult 25+"
        },
        {
          "value": "N/A",
          "label": "Prefer not to answer"
        }
      ],
    },
    {
      type: 'input-text',
      name: 'genderInput',
      label: 'What is your gender identity?',
      placeholder: '',
      required: true,
    },
    {
      label: 'What state are you chatting from?',
      type: 'select',
      name: 'childState',
      required: true,
      defaultValue: '',
      options: [
        {
          "value": "",
          "label": ""
        },
        {
          "value": "Out of USA",
          "label": "Out of USA"
        },
        {
          "value": "Alabama",
          "label": "Alabama"
        },
        {
          "value": "Alaska",
          "label": "Alaska"
        },
        {
          "value": "Arizona",
          "label": "Arizona"
        },
        {
          "value": "Arkansas",
          "label": "Arkansas"
        },
        {
          "value": "California",
          "label": "California"
        },
        {
          "value": "Colorado",
          "label": "Colorado"
        },
        {
          "value": "Connecticut",
          "label": "Connecticut"
        },
        {
          "value": "Delaware",
          "label": "Delaware"
        },
        {
          "value": "Florida",
          "label": "Florida"
        },
        {
          "value": "Georgia",
          "label": "Georgia"
        },
        {
          "value": "Hawaii",
          "label": "Hawaii"
        },
        {
          "value": "Idaho",
          "label": "Idaho"
        },
        {
          "value": "Illinois",
          "label": "Illinois"
        },
        {
          "value": "Indiana",
          "label": "Indiana"
        },
        {
          "value": "Iowa",
          "label": "Iowa"
        },
        {
          "value": "Kansas",
          "label": "Kansas"
        },
        {
          "value": "Kentucky",
          "label": "Kentucky"
        },
        {
          "value": "Louisiana",
          "label": "Louisiana"
        },
        {
          "value": "Maine",
          "label": "Maine"
        },
        {
          "value": "Maryland",
          "label": "Maryland"
        },
        {
          "value": "Massachusetts",
          "label": "Massachusetts"
        },
        {
          "value": "Michigan",
          "label": "Michigan"
        },
        {
          "value": "Minnesota",
          "label": "Minnesota"
        },
        {
          "value": "Mississippi",
          "label": "Mississippi"
        },
        {
          "value": "Missouri",
          "label": "Missouri"
        },
        {
          "value": "Montana",
          "label": "Montana"
        },
        {
          "value": "Nebraska",
          "label": "Nebraska"
        },
        {
          "value": "Nevada",
          "label": "Nevada"
        },
        {
          "value": "New Hampshire",
          "label": "New Hampshire"
        },
        {
          "value": "New Jersey",
          "label": "New Jersey"
        },
        {
          "value": "New Mexico",
          "label": "New Mexico"
        },
        {
          "value": "New York",
          "label": "New York"
        },
        {
          "value": "North Carolina",
          "label": "North Carolina"
        },
        {
          "value": "North Dakota",
          "label": "North Dakota"
        },
        {
          "value": "Ohio",
          "label": "Ohio"
        },
        {
          "value": "Oklahoma",
          "label": "Oklahoma"
        },
        {
          "value": "Oregon",
          "label": "Oregon"
        },
        {
          "value": "Pennsylvania",
          "label": "Pennsylvania"
        },
        {
          "value": "Rhode Island",
          "label": "Rhode Island"
        },
        {
          "value": "South Carolina",
          "label": "South Carolina"
        },
        {
          "value": "South Dakota",
          "label": "South Dakota"
        },
        {
          "value": "Tennessee",
          "label": "Tennessee"
        },
        {
          "value": "Texas",
          "label": "Texas"
        },
        {
          "value": "Utah",
          "label": "Utah"
        },
        {
          "value": "Vermont",
          "label": "Vermont"
        },
        {
          "value": "Virginia",
          "label": "Virginia"
        },
        {
          "value": "Washington",
          "label": "Washington"
        },
        {
          "value": "Washington, D.C.",
          "label": "Washington, D.C."
        },
        {
          "value": "West Virginia",
          "label": "West Virginia"
        },
        {
          "value": "Wisconsin",
          "label": "Wisconsin"
        },
        {
          "value": "Wyoming",
          "label": "Wyoming"
        },
        {
          "value": "Unknown",
          "label": "Unknown"
        },
        {
          "value": "N/A",
          "label": "Prefer not to answer"
        }
      ],
    },
    {
      label: 'How did you hear about this hotline?',
      name: 'howTheHelpseekerHeardAboutUs',
      type: 'select',
      required: true,
      options: [
        {
          "value": "",
          "label": ""
        },
        {
          "value": "Billboard",
          "label": "Billboard"
        },
        {
          "value": "Book",
          "label": "Book"
        },
        {
          "value": "Chat GPT/AI",
          "label": "Chat GPT/AI"
        },
        {
          "value": "Discord",
          "label": "Discord"
        },
        {
          "value": "Family Member",
          "label": "Family Member"
        },
        {
          "value": "Friend",
          "label": "Friend"
        },
        {
          "value": "In and Out Burger Bag",
          "label": "In and Out Burger Bag"
        },
        {
          "value": "John Stamos",
          "label": "John Stamos"
        },
        {
          "value": "Marketing Media",
          "label": "Marketing Media"
        },
        {
          "value": "National Center for Missing and Exploited Children",
          "label": "National Center for Missing and Exploited Children"
        },
        {
          "value": "National Domestic Violence Hotline",
          "label": "National Domestic Violence Hotline"
        },
        {
          "value": "National Runaway Safeline",
          "label": "National Runaway Safeline"
        },
        {
          "value": "National Sexual Assault Hotline",
          "label": "National Sexual Assault Hotline"
        },
        {
          "value": "National Suicide Prevention Lifeline (988)",
          "label": "National Suicide Prevention Lifeline (988)"
        },
        {
          "value": "NEDA Helpline",
          "label": "NEDA Helpline"
        },
        {
          "value": "Newspaper/Magazine",
          "label": "Newspaper/Magazine"
        },
        {
          "value": "Other",
          "label": "Other"
        },
        {
          "value": "Other Hotline",
          "label": "Other Hotline"
        },
        {
          "value": "Phonebook/Operator",
          "label": "Phonebook/Operator"
        },
        {
          "value": "Professional",
          "label": "Professional"
        },
        {
          "value": "Radio",
          "label": "Radio"
        },
        {
          "value": "Repeat Call/Called Before",
          "label": "Repeat Call/Called Before"
        },
        {
          "value": "SNAP",
          "label": "SNAP"
        },
        {
          "value": "Social Media: Facebook",
          "label": "Social Media: Facebook"
        },
        {
          "value": "Social Media: Instagram",
          "label": "Social Media: Instagram"
        },
        {
          "value": "Social Media: Reddit",
          "label": "Social Media: Reddit"
        },
        {
          "value": "Social Media: Snapchat",
          "label": "Social Media: Snapchat"
        },
        {
          "value": "Social Media: Spotify",
          "label": "Social Media: Spotify"
        },
        {
          "value": "Social Media: TikTok",
          "label": "Social Media: TikTok"
        },
        {
          "value": "Social Media: X (formerly Twitter)",
          "label": "Social Media: X (formerly Twitter)"
        },
        {
          "value": "Social Media: Unspecified",
          "label": "Social Media: Unspecified"
        },
        {
          "value": "SUBS - Childhelp Speak Up Be Safe Program",
          "label": "SUBS - Childhelp Speak Up Be Safe Program"
        },
        {
          "value": "Television/Streaming Services",
          "label": "Television/Streaming Services"
        },
        {
          "value": "Unknown",
          "label": "Unknown"
        },
        {
          "value": "Website-Internet",
          "label": "Website-Internet"
        },
        {
          "value": "YouTube",
          "label": "YouTube"
        },
        {
          "value": "N/A",
          "label": "Prefer not to answer"
        }
      ]
      ,
    }, 
    {
      label: 'Are you reaching out on behalf of yourself or another person?',
      type: 'select',
      name: 'callingAboutSelf',
      options: [
        {
          "value": "Yes",
          "label": "Myself"
        },
        {
          "value": "No",
          "label": "Someone else"
        }
      ],
    },
    {
      label: 'What is your preferred language?',
      type: 'select',
      name: 'language',
      options: [
        {
          "value": "English",
          "label": "English"
        },
        {
          "value": "Other",
          "label": "Other"
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
        message: "Sorry, if you don't accept our terms and conditions we can't provide counseling to you.",
      }, 
    },
  ],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'To best serve you, answer 4 short questions and you will then be connected to a counselor. You can select "Prefer not to answer" for any question. ',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a counselor.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Counselor is typing',
    StartChat: 'Start Chat!',
    MessageCanvasTrayButton: 'Start New Chat',
    Email: 'Email',
    Edad: 'Age',
    Gender: 'What is your gender',
    Masculino: 'Male',
    Femenino: 'Female',
    Otro: 'Other',
    PrefieroNoDecir: 'Prefer not to say',
    Nickname: 'Nickname',
  },
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Counselor',
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
  closedHours,
  holidayHours,
  checkOpenHours,
  mapHelplineLanguage,
  memberDisplayOptions,
  captureIp,
  contactType,
};
