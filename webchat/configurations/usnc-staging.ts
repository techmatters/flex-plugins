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

const accountSid = "ACaa9a5ca4395d1fdeb394c5c176bc5b40";
const flexFlowSid = "FOe92d0154e36ef683c6569e03e6515d99";
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
  description: "PreEngagementDescription",
  submitLabel: "LetsChat",
  fields: [
    {
      type: "select",
      name: "race",
      label: "Which race do you identify with?",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "White",
          label: "White",
        },
        {
          value: "Black/African American",
          label: "Black/African American",
        },
        {
          value: "Asian",
          label: "Asian",
        },
        {
          value: "American Indian",
          label: "American Indian",
        },
        {
          value: "Native Hawaiian or Other Pacific Islander",
          label: "Native Hawaiian or Other Pacific Islander",
        },
        {
          value: "Two or More Races",
          label: "Two or More Races",
        },
        {
          value: "Other",
          label: "Other",
        },
      ],
      required: true,
    },
    {
      type: "select",
      name: "ethnicity",
      label: "What is your ethnicity?",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "",
          label: "",
        },
      ],
      required: true,
    },
    {
      type: "select",
      name: "ageRange",
      label: "Which age range are you in?",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "18-24",
          label: "18-24",
        },
        {
          value: "25-34",
          label: "25-34",
        },
        {
          value: "35-44",
          label: "35-44",
        },
        {
          value: "45-54",
          label: "45-54",
        },
        {
          value: "55+",
          label: "55+",
        },
      ],
      required: true,
    },
    {
      type: "select",
      name: "gender",
      label: "What is your gender?",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "Male",
          label: "Male",
        },
        {
          value: "Female",
          label: "Female",
        },
        {
          value: "Non-binary",
          label: "Non-binary",
        },
        {
          value: "Two-Spirit",
          label: "Two-Spirit",
        },
        {
          value: "TransMasc",
          label: "TransMasc",
        },
        {
          value: "TransFemme",
          label: "TransFemme",
        },
        {
          value: "Other",
          label: "Other",
        },
      ],
      required: true,
    },
    {
      type: "select",
      name: "pronouns",
      label: "What pronouns do you use?",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "He/Him/His",
          label: "He/Him/His",
        },
        {
          value: "She/Her/Hers",
          label: "She/Her/Hers",
        },
        {
          value: "They/Them/Theirs",
          label: "They/Them/Theirs",
        },
        {
          value: "Other",
          label: "Other",
        },
      ],
      required: true,
    },
    {
      type: "select",
      name: "militaryStatus",
      label: "What is your military status?",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "Active Duty",
          label: "Active Duty",
        },
        {
          value: "Retired",
          label: "Retired",
        },
        {
          value: "Veteran (non-career)",
          label: "Veteran (non-career)",
        },
        {
          value: "Non-Military",
          label: "Non-Military",
        },
        {
          value: "National Guard/Reserves",
          label: "National Guard/Reserves",
        },
        {
          value: "Military Partner",
          label: "Military Partner",
        },
        {
          value: "Military Family Member",
          label: "Military Family Member",
        },
      ],
      required: true,
    },
    {
      type: "checkbox",
      name: "988Referral",
      label: "I was referred here by 988",
      required: true,
    },
    {
      type: "checkbox",
      name: "termsAndConditions",
      label: 'I\'ve read and accept the <a href="https://www.google.com">Terms and Conditions</a>',
      required: {
        value: true,
        message: "<message>",
      },
    },
  ],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to PRN Warm Line',
    PreEngagementConfigDescription : 'Welcome! Thank you for reaching out. To best serve you, please answer the questions below before we connect you to a Peer Supporter.',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a supporter.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Supporter is typing',
    StartChat: 'Start Chat!',
    MessageCanvasTrayButton: 'Start New Chat',
    Nickname: 'Nickname',
  },
  'Other': {
    WelcomeMessage: 'Welcome to PRN Warm Line',
    PreEngagementConfigDescription : 'Welcome! Thank you for reaching out. To best serve you, please answer the questions below before we connect you to a Peer Supporter.',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a supporter.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Supporter is typing',
    StartChat: 'Start Chat!',
    MessageCanvasTrayButton: 'Start New Chat',
    Nickname: 'Nickname',
  },
};



const memberDisplayOptions = {
  yourDefaultName: "You",
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: "supporter",
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  switch (helpline) {
    case "Børns Vilkår (DK)":
      return "da";
    case "BRIS (SE)":
      return "sv";
    case "Child Helpline Cambodia (KH)":
      return "km";
    case "Jordan River 110 (JO)":
      return "ar";
    case "Palo Alto Testing (Text)":
      return "en-US";
    case "SMILE OF THE CHILD (GR)":
      return "el";
    case "Telefono Azzurro (IT)":
      return "it";
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
  twilioServicesUrl: new URL(
    `https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`,
  ),
};
