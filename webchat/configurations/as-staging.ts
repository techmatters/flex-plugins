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

const translations: Translations = {
  ar: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
  el: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
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
  es: {
    EntryPointTagline: 'Chatea con nosotros',
    MessageCanvasTrayButton: 'EMPEZAR NUEVO CHAT',
    InvalidPreEngagementMessage:
      'Los formularios previos al compromiso no se han establecido y son necesarios para iniciar el chat web. Por favor configúrelos ahora en la configuración.',
    InvalidPreEngagementButton: 'Aprende más',
    PredefinedChatMessageAuthorName: 'Bot',
    PredefinedChatMessageBody: '¡Hola! ¿Cómo podemos ayudarte hoy?',
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

    BotGreeting: '¿Cómo puedo ayudar?',
    WelcomeMessage: '¡Bienvenido a Aselo!',
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',

    // Needs to be translated
    WhatIsYourHelpline: 'What is your helpline?',
    SelectHelpline: 'Select helpline',
    FakeHelpline: 'Fake Helpline',
    LetsChat: "Let's chat!",
  },
  da: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
  it: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
  km: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
  sv: {
    MessageCanvasTrayContent: '',
    AutoFirstMessage: '',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'LetsChat',
  fields: [
    {
      type: 'select',
      name: 'helpline',
      label: 'What is your helpline?',
      defaultValue: 'Select helpline',
      options: [
        { value: 'Select helpline', label: 'WhatIsYourHelpline' },
        { value: 'Børns Vilkår (DK)', label: 'Børns Vilkår (DK)' },
        { value: 'Childhelp (US)', label: 'Childhelp (US)' },
        { value: 'CHILDLINE India (IN)', label: 'CHILDLINE India (IN)' },
        { value: 'Childline South Africa (SA)', label: 'Childline South Africa (SA)' },
        { value: 'ChildLine Zambia (ZM)', label: 'ChildLine Zambia (ZM)' },
        { value: 'Child Helpline Cambodia (KH)', label: 'Child Helpline Cambodia (KH)' },
        { value: 'Jordan River 110 (JO)', label: 'Jordan River 110 (JO)' },
        { value: 'SMILE OF THE CHILD (GR)', label: 'SMILE OF THE CHILD (GR)' },
        { value: 'Telefono Azzurro (IT)', label: 'Telefono Azzurro (IT)' },
        { value: 'BRIS (SE)', label: 'BRIS (SE)' },
        { value: '2NDFLOOR (US)', label: '2NDFLOOR (US)' },
        { value: 'Palo Alto Testing (Text)', label: 'Palo Alto Testing (Text)' },
      ],
    },
  ],
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  switch (helpline) {
    case 'Børns Vilkår (DK)':
      return 'da';
    case 'BRIS (SE)':
      return 'sv';
    case 'Child Helpline Cambodia (KH)':
      return 'km';
    case 'Jordan River 110 (JO)':
      return 'ar';
    case 'Palo Alto Testing (Text)':
      return 'en-US';
    case 'SMILE OF THE CHILD (GR)':
      return 'el';
    case 'Telefono Azzurro (IT)':
      return 'it';
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
};
