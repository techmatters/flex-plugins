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

import type { Translations, Configuration, MapHelplineLanguage } from '../types';
import { PreEngagementFormDefinition } from '../src/pre-engagement-form';

const accountSid = 'ACd8a2e89748318adf6ddff7df6948deaf';
const flexFlowSid = 'FO8c2d9c388e7feba8b08d06a4bc3f69d1';
const defaultLanguage = 'en-US';
const captureIp = true;
const checkOpenHours = true;
const contactType = 'ip';
const showEmojiPicker = true;
const enableRecaptcha = true;

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to Aselo!',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold: 'Please hold for a counselor.',
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription: `Let's get started`,
    WhatIsYourHelpline: 'What is your helpline?',
    SelectHelpline: 'Select helpline',
    FakeHelpline: 'Fake Helpline',
    LetsChat: "Let's chat!",
  },
  es: {
    EntryPointTagline: 'Chatea con nosotros',
    MessageCanvasTrayButton: 'EMPEZAR NUEVO CHAT',
    InvalidPreEngagementMessage:
      'Los formularios previos al compromiso no se han establecido y son necesarios para iniciar el chat web. Por favor configúrelos ahora en la configuración.',
    InvalidPreEngagementButton: 'Aprende más',
    InputPlaceHolder: 'Escribe un mensaje',
    TypingIndicator: '{0} está escribiendo ... ',
    Read: 'Visto',
    MessageSendingDisabled: 'El envío de mensajes ha sido desactivado',
    Today: 'HOY',
    Yesterday: 'AYER',
    Save: 'GUARDAR',
    Reset: 'RESETEAR',
    MessageCharacterCountStatus: '{{currentCharCount}} / {{maxCharCount}}',
    SendMessageTooltip: 'Enviar Mensaje',
    FieldValidationRequiredField: 'Campo requerido',
    FieldValidationInvalidEmail: 'Por favor provea una dirección válida de email',

    PreEngagementDescription: 'Comencemos',

    // Needs to be translated
    WhatIsYourHelpline: 'What is your helpline?',
    SelectHelpline: 'Select helpline',
    FakeHelpline: 'Fake Helpline',
    LetsChat: "Let's chat!",

    WelcomeMessage: '¡Bienvenido a Aselo!',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
  dk: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'LetsChat',
  fields: [
    {
      type: 'input-text',
      name: 'name',
      label: 'First Name',
      placeholder: 'John',
      required: true,
    },
    {
      name: 'province',
      label: 'Province',
      type: 'select',
      options: [
        { value: '', label: '' },
        { value: 'Northern', label: 'Northern' },
        { value: 'Eastern', label: 'Eastern' },
        { value: 'Western', label: 'Western' },
        { value: 'Southern', label: 'Southern' },
        { value: 'Unknown', label: 'Unknown' },
      ],
      required: { value: true, message: 'RequiredFieldError' },
    },
    {
      name: 'vulnerableGroups',
      label: 'Vulnerable Groups',
      type: 'select',
      options: [
        {
          value: 'Child in conflict with the law',
          label: 'Child in conflict with the law',
        },
        {
          value: 'Child living in conflict zone',
          label: 'Child living in conflict zone',
        },
        {
          value: 'Child living in poverty',
          label: 'Child living in poverty',
        },
        {
          value: 'Child member of an ethnic, racial or religious minority',
          label: 'Child member of an ethnic, racial or religious minority',
        },
        {
          value: 'Child on the move (involuntarily)',
          label: 'Child on the move (involuntarily)',
        },
        {
          value: 'Child on the move (voluntarily)',
          label: 'Child on the move (voluntarily)',
        },
        {
          value: 'Child with disability',
          label: 'Child with disability',
        },
        {
          value: 'LGBTQI+/SOGIESC child',
          label: 'LGBTQI+/SOGIESC child',
        },
        {
          value: 'Out-of-school child',
          label: 'Out-of-school child',
        },
        {
          value: 'Other',
          label: 'Other',
        },
      ],
    },
    {
      label: 'Are you reaching out on behalf of yourself or another person?',
      type: 'select',
      defaultValue: 'myself',
      name: 'myselfOrOther',
      options: [
        {
          value: 'myself',
          label: 'Myself',
        },
        {
          value: 'other',
          label: 'Someone else',
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'Accept <a href="https://www.redpapaz.org/wp-content/uploads/2019/02/Politica_de_Tratamiento_de_Informacion_-_Red_PaPaz.pdf">terms and conditions</a>',
      required: {
        value: true,
        message: 'You need to accept the terms and conditions',
      },
    },
  ],
};

const closedHours: PreEngagementFormDefinition = {
  description: "We're closed at the moment. Operating hours are 8am-6pm",
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description: 'We are closed because it is a holiday. Please come back tomorrow',
  fields: [],
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  switch (helpline) {
    case 'Fake Helpline':
      return 'dk';
    default:
      return defaultLanguage;
  }
};

const blockedEmojis = [
  'beer',
  'beers',
  'wine_glass',
  'cocktail',
  'tropical_drink',
  'tumbler_glass',
  'smoking',
  'middle_finger',
  'wink',
  'stuck_out_tongue_winking_eye',
  'kissing_heart',
  'kissing',
  'kissing_closed_eyes',
  'kissing_smiling_eyes',
  'tongue',
  'eggplant',
  'peach',
  'dancers',
  'men-with-bunny-ears-partying',
  'women-with-bunny-ears-partying',
  'syringe',
  'pill',
];
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
  captureIp,
  contactType,
  showEmojiPicker,
  blockedEmojis,
  memberDisplayOptions,
  enableRecaptcha,
  twilioServicesUrl: new URL(`https://hrm-development.tl.techmatters.org/lambda/twilio/account-scoped/${accountSid}`),
};
