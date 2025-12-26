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

const accountSid = 'AC19e76d8895ab396b3e56eda95adbfa21';
const flexFlowSid = 'FO44e7331dfccffc2ed6a03dd6bc43ee43';
const defaultLanguage = 'es-CL';
const captureIp = true;
const checkOpenHours = false;
const contactType: ContactType = 'email';

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Hora Segura',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a counsellor.",
    AutoFirstMessage: 'Incoming webchat contact from',
    PreEngagementDescription:
      'Thank you for contacting Hora Segura. To chat with a counsellor, please type your name and select the Start Chat button.',
    WhatIsYourName: 'What is your name?',
    StartChat: 'Start Chat!',
  },
  'es-CL': {
    WelcomeMessage: '¡Bienvenid@ a Hora Segura!',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      'Muchas gracias por la información. Lo transferiremos ahora. Por favor espere for un agente.',
    AutoFirstMessage: 'Nuevo contacto del webchat de',
    TypingIndicator: '{0} está escribiendo ... ',
    StartChat: 'Comenzar Nuevo Chat!',
    MessageCanvasTrayButton: 'Comenzar Nuevo Chat',
    EntryPointTagline: 'Chatea con nosotros',
    InvalidPreEngagementMessage:
      'Los formularios previos al compromiso no se han establecido y son necesarios para iniciar el chat web. Por favor configúrelos ahora en la configuración.',
    InvalidPreEngagementButton: 'Aprende más',
    PredefinedChatMessageAuthorName: 'Bot',
    PredefinedChatMessageBody: '¡Hola! ¿Cómo podemos ayudarte hoy?',
    InputPlaceHolder: 'Escribe un mensaje',
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
    Gender: '¿Cuál es tu género?',
    Masculino: 'Masculino',
    Femenino: 'Femenino',
    Otro: 'Otro',
    PrefieroNoDecir: 'Prefiero no decir',
    Email: 'Email',
    Edad: 'Edad',
    Nickname: 'Nickname',
  },
};

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'PreEngagementDescription',
  submitLabel: 'StartChat',
  fields: [
       {
      type: "input-text",
      name: "nameOrNickname",
      label: "Nombre/Apodo",
      placeholder: "Nombre/Apodo",
      required: true,
    },
    {
      type: 'input-text',
      name: 'contactIdentifier',
      label: 'Email',
      required: true,
      placeholder: 'Email',
      pattern: {
        value: EMAIL_PATTERN,
        message: 'FieldValidationInvalidEmail',
      },
    },
    {
      type: "select",
      name: "age",
      label: "Edad",
      defaultValue: "",
      options: [
        {
          value: "",
          label: "",
        },
        {
          value: "00",
          label: "0",
        },
        {
          value: "01",
          label: "1",
        },
        {
          value: "02",
          label: "2",
        },
        {
          value: "03",
          label: "3",
        },
        {
          value: "04",
          label: "4",
        },
        {
          value: "05",
          label: "5",
        },
        {
          value: "06",
          label: "6",
        },
        {
          value: "07",
          label: "7",
        },
        {
          value: "08",
          label: "8",
        },
        {
          value: "09",
          label: "9",
        },
        {
          value: "10",
          label: "10",
        },
        {
          value: "11",
          label: "11",
        },
        {
          value: "12",
          label: "12",
        },
        {
          value: "13",
          label: "13",
        },
        {
          value: "14",
          label: "14",
        },
        {
          value: "15",
          label: "15",
        },
        {
          value: "16",
          label: "16",
        },
        {
          value: "17",
          label: "17",
        },
        {
          value: "18",
          label: "18",
        },
        {
          value: "19",
          label: "19",
        },
        {
          value: "20",
          label: "20",
        },
        {
          value: "21",
          label: "21",
        },
        {
          value: "22",
          label: "22",
        },
        {
          value: "23",
          label: "23",
        },
        {
          value: "24",
          label: "24",
        },
        {
          value: "25",
          label: "25",
        },
        {
          value: "26",
          label: "26",
        },
        {
          value: "27",
          label: "27",
        },
        {
          value: "28",
          label: "28",
        },
        {
          value: "29",
          label: "29",
        },
        {
          value: "30 o más",
          label: "30 o más",
        },
      ],
      required: true,
    },

  ],
  
};

const mapHelplineLanguage: MapHelplineLanguage = (helpline) => {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (helpline) {
    default:
      return defaultLanguage;
  }
};

const memberDisplayOptions = {
  yourDefaultName: 'You',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Hora Segura Counsellor',
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
