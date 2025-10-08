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

const accountSid = 'AC874af45ec4a696d5d4dca07b0036e2bf';
const flexFlowSid = 'FO7fb4e9816507d650ddc221f27d2d8927';
const defaultLanguage = 'en-US';
const captureIp = true;
const contactType: ContactType = 'ip';

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to Tithandizane Helpline',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold: 'Please hold for a counselor.',
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription: "Let's get started",
    LabelHiddenField: 'Hidden Field',
    StartChat: 'Start Chat!',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'StartChat',
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
  theirDefaultName: 'Tithandizane Counsellor',
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
  twilioServicesUrl: new URL(`https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
