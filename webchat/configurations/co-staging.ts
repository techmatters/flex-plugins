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

const accountSid = 'AC76b8bd2798b01b067a1be7f17d36c894';
const flexFlowSid = 'FOd992a9ef451a263c83c8e556b5393887';
const defaultLanguage = 'es-CO';
const captureIp = true;
const checkOpenHours = false;
const contactType: ContactType = 'ip';

const preEngagementConfig: PreEngagementFormDefinition = {
  description: 'WelcomeMessage',
  submitLabel: 'StartChat',
  fields: [
    {
      type: 'checkbox',
      name: 'termsAndConditions',
      label:
        'Tu privacidad es nuestra prioridad: No pedimos datos personales y puedes hablar con nosotros de forma anónima.\n 🔹 Solo guardamos información estadística para mejorar el servicio.,\n Los registros se eliminan en 15 días hábiles. Si hay riesgo para ti o alguien más, podríamos informar a las autoridades. Consulta nuestra política de privacidad aquí.Para continuar, ¿aceptas los términos y condiciones de nuestra política de privacidad? <a href="https://www.linealibre.cl/wp-content/uploads/2020/11/TERMINOS-Y-CONDICIONES-DE-USO-Y-POLITICA-DE-PRIVACIDAD-LL.pdf">términos y condiciones</a>',
      required: {
        value: true,
        message: 'Tienes que approbar los términos y condiciones para poder iniciar un chat.',
      },
    },
  ],
};

const closedHours: PreEngagementFormDefinition = {
  description:
    'Por el momento no estamos atendiendo. Nuestros horarios de atención son de Lunes a Viernes de 8am a 5pm.',
  fields: [],
};

const holidayHours: PreEngagementFormDefinition = {
  description: 'Lo siento, no atendemos durante días festivos. ¡Vuelve a escribirnos en el siguiente día hábil!',
  fields: [],
};

const translations: Translations = {
  'en-US': {
    WelcomeMessage: 'Welcome to the Te Guio Helplines',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      "Thank you very much for this information. We'll transfer you now. Please hold for a practitioner.",
    AutoFirstMessage: 'Incoming webchat contact from',
    TypingIndicator: 'Counselor is typing',
    StartChat: 'Start Chat!',
    MessageCanvasTrayButton: 'Start New Chat',
  },
  'es-CO': {
    WelcomeMessage: '¡Bienvenido a Te Guío! \n Tu privacidad es nuestra prioridad: No pedimos datos personales y puedes hablar con nosotros de forma anónima.\n 🔹 Solo guardamos información estadística para mejorar el servicio.,\n Los registros se eliminan en 15 días hábiles. Si hay riesgo para ti o alguien más, podríamos informar a las autoridades. Consulta nuestra política de privacidad aquí.Para continuar, ¿aceptas los términos y condiciones de nuestra política de privacidad? <a href="https://www.linealibre.cl/wp-content/uploads/2020/11/TERMINOS-Y-CONDICIONES-DE-USO-Y-POLITICA-DE-PRIVACIDAD-LL.pdf">términos y condiciones</a>',
    MessageCanvasTrayContent: '',
    MessageInputDisabledReasonHold:
      'Muchas gracias por la información. Lo transferiremos ahora. Por favor espere for un guía.',
    AutoFirstMessage: 'Nuevo contacto del webchat de',
    TypingIndicator: '{0} está escribiendo ... ',
    StartChat: 'Comienza a Chatear!',
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
    PreEngagementDescription: '¡Bienvenido a Te Guío! \n Tu privacidad es nuestra prioridad: No pedimos datos personales y puedes hablar con nosotros de forma anónima.\n 🔹 Solo guardamos información estadística para mejorar el servicio.,\n Los registros se eliminan en 15 días hábiles. Si hay riesgo para ti o alguien más, podríamos informar a las autoridades. Consulta nuestra política de privacidad aquí.Para continuar, ¿aceptas los términos y condiciones de nuestra política de privacidad? <a href="https://www.linealibre.cl/wp-content/uploads/2020/11/TERMINOS-Y-CONDICIONES-DE-USO-Y-POLITICA-DE-PRIVACIDAD-LL.pdf">términos y condiciones</a>',
    BotGreeting: '¿Cómo puedo ayudar?',
  },
};

const memberDisplayOptions = {
  yourDefaultName: 'Usted',
  yourFriendlyNameOverride: false,
  theirFriendlyNameOverride: false,
  theirDefaultName: 'Guía',
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
