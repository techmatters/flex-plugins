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

const accountSid = 'AC16dd71c6fd135ee250bd213ad1efa2e8';
const flexFlowSid = 'FOd655fd61e9e7ac6faf9d0be97a49863b';
const defaultLanguage = 'en-US';
const captureIp = true;
const checkOpenHours = false;
const contactType: ContactType = 'ip';
const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to Childline SA’s Online Counselling Service',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold: 'Please hold for a counselor.',
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription:
      'Thank you for contacting Childline South Africa. To chat with a counsellor, please type your name and select the Start Chat button.',
    WhatIsYourName:
      'What is your name? (This may be just a screen name, or a nick name, if you are not comfortable giving us your real name) \n We are here Monday – Friday, 11am-1pm & 2pm-6pm. If you need to speak to a Counsellor urgently, call our 24 hour Tollfree Number on 116.',
    GuestsName: "Guest's name. Please enter only your name.",
    StartChat: 'Start Chat!',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'input-text',
      name: 'friendlyName',
      label: 'WhatIsYourName',
      placeholder: 'GuestsName',
      required: true,
    },
  ],
};

const closedHours: PreEngagementFormDefinition = {
  description:
    'Our counsellors are currently offline. We are here Monday – Friday, 11am-1pm & 2pm-6pm. If you need to speak to a Counsellor, call our 24 hour Tollfree Number on 116. If you feel you are in immediate danger, please call the Police on 10111.',
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description:
    'Our counsellors are currently offline for the Public Holiday today. We are here on normal working days: Monday – Friday, 11am-1pm & 2pm-6pm. Please note that messages sent on this platform out of these hours are not received by our team and if you need to speak to a Counsellor, call our 24 hour Tollfree Number on 116. If you feel you are in immediate danger, please call the Police on 10111.',
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
  theirDefaultName: 'Counsellor',
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
  twilioServicesUrl: new URL(`https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
