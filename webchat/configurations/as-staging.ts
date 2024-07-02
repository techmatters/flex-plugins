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

const accountSid = 'AC1ca120bc71593bbe9ca78e2232a31e0d';
const flexFlowSid = 'FOf35e65754798822c36fb92e2e495227b';
const defaultLanguage = 'en-US';
const captureIp = true;
const contactType: ContactType = 'ip';
const enableRecaptcha = true;

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to Aselo!',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold: 'Please hold for a counsellor.',
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription: `Let's get started`,
    WhatIsYourHelpline: 'What is your helpline?',
    SelectHelpline: 'Select helpline',
    LetsChat: "Let's chat!",
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'LetsChat',
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
          value: "Boy",
          label: "Boy"
        },
        {
          value: "Girl",
          label: "Girl"
        },
        {
          value: "Non-Binary",
          label: "Non-Binary"
        },
        {
          value: "Unknown",
          label: "Unknown"
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
        { value: "", label: "" },
        { value: "Unborn", label: "Unborn" },
        { value: "0", label: "0" },
        { value: "01", label: "1" },
        { value: "02", label: "2" },
        { value: "03", label: "3" },
        { value: "04", label: "4" },
        { value: "05", label: "5" },
        { value: "06", label: "6" },
        { value: "07", label: "7" },
        { value: "08", label: "8" },
        { value: "09", label: "9" },
        { value: "10", label: "10" },
        { value: "11", label: "11" },
        { value: "12", label: "12" },
        { value: "13", label: "13" },
        { value: "14", label: "14" },
        { value: "15", label: "15" },
        { value: "16", label: "16" },
        { value: "17", label: "17" },
        { value: "18", label: "18" },
        { value: "19", label: "19" },
        { value: "20", label: "20" },
        { value: "21", label: "21" },
        { value: "22", label: "22" },
        { value: "23", label: "23" },
        { value: "24", label: "24" },
        { value: "25", label: "25" },
        { value: ">25", label: ">25" },
        { value: "Unknown", label: "Unknown" }
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label: 'I agree with the <a href="https://techmatters.org/">Terms and Conditions</a>',
      required: {
        value: true,
        message: 'You need to agree with our terms of use to start a chat ',
      },
    },
  ],
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
  captureIp,
  contactType,
  enableRecaptcha,
};
