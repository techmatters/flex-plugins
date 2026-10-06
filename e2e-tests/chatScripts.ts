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

import {
  ChatStatement,
  botStatement,
  callerStatement,
  counselorAutoStatement,
  counselorStatement,
} from './chatModel';
import { getConfigValue } from './config';

export const defaultScript: ChatStatement[] = [
  botStatement('Welcome to the helpline. Please answer the following questions.'),
  callerStatement('yes'),
  botStatement('How old are you?'),
  callerStatement('10'),
  botStatement('What is your gender?'),
  callerStatement('girl'),
  botStatement('We will transfer you now. Please hold for a counsellor.'),
  counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
  callerStatement('CALLER TEST CHAT MESSAGE'),
  counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
];

export const commonScripts: Record<string, ChatStatement[]> = {
  ca: [
    // botStatement(
    //   'You are number 1 in line. To keep your chat active, please do not leave/refresh this window or hit the back button.',
    // ),
    counselorAutoStatement("Hi, you've reached a counsellor. What would you like to talk about?"),
    callerStatement('CALLER TEST CHAT MESSAGE'),
    counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
  ],
};

export const envScripts: Record<string, Record<string, ChatStatement[]>> = {
  development: {
    as: [
      botStatement("Sorry, I didn't understand that. Please try again."),
      callerStatement('hi'),
      botStatement('Are you calling about yourself? Please answer Yes or No.'),
      callerStatement('yes'),
      botStatement('How old are you?'),
      callerStatement('10'),
      botStatement('What is your gender?'), // Step required in Aselo Dev, not in E2E
      callerStatement('girl'),
      botStatement("We'll transfer you now. Please hold for a counsellor."),
      counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
      callerStatement('CALLER TEST CHAT MESSAGE'),
      counselorStatement('COUNSELLOR TEST CHAT MESSAGE'),
    ],
  },
};

export const getWebchatScript = (): ChatStatement[] => {
  const helplineShortCode = getConfigValue('helplineShortCode') as string;
  const helplineEnv = getConfigValue('helplineEnv') as string;

  if (envScripts[helplineEnv]?.[helplineShortCode]) {
    return envScripts[helplineEnv]?.[helplineShortCode];
  }

  if (commonScripts[helplineShortCode]) {
    return commonScripts[helplineShortCode];
  }

  return defaultScript;
};

/**
 * SMS scripts are structurally the same as webchat scripts (using the same ChatStatement format),
 * but must start with a CALLER statement since the client must initiate an SMS conversation.
 * BOT messages are expected to arrive after the client sends its first message.
 */
export const defaultSmsScript: ChatStatement[] = [
  callerStatement('hi'),
  botStatement('Welcome to the helpline. Please answer the following questions.'),
  callerStatement('yes'),
  botStatement('How old are you?'),
  callerStatement('10'),
  botStatement('What is your gender?'),
  callerStatement('girl'),
  botStatement('We will transfer you now. Please hold for a counsellor.'),
  counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
  callerStatement('CALLER TEST SMS MESSAGE'),
  counselorStatement('COUNSELLOR TEST SMS MESSAGE'),
];

export const smsCommonScripts: Record<string, ChatStatement[]> = {
  ca: [
    callerStatement('CALLER TEST SMS MESSAGE'),
    counselorAutoStatement("Hi, you've reached a counsellor. What would you like to talk about?"),
    counselorStatement('COUNSELLOR TEST SMS MESSAGE'),
  ],
  usnm: [
    callerStatement('hi'),
    botStatement(
      "Welcome to the NAMI HelpLine. We are here to help with your mental health concerns, offer resources, and share support. If you are in crisis, reply CRISIS. Review NAMI HelpLine's Terms of Use: https://www.nami.org/terms-of-use/nami-helpline-terms-of-service/.\n" +
        '\n' +
        'If you understand and agree to the terms of use, reply GO.',
    ),
    callerStatement('GO'),
    botStatement(
      "We're glad you connected with the NAMI HelpLine. Would you mind sharing your name? If you want to remain anonymous, text NONE.",
    ),
    callerStatement('E2E test user'),
    botStatement(
      'NAMI is now offering a Teen and Young Adult HelpLine service. It brings together young people with shared experiences and equips specially trained HelpLine Specialists with knowledge and insights into what helps.',
    ),
    botStatement(
      'NAMI is now offering a Family Caregiver HelpLine service. It brings together family caregivers with shared experiences and equips HelpLine Specialists with knowledge and insights into what helps.',
    ),
    botStatement(
      'Please choose an option:\n' +
        'Reply 1 to connect with a HelpLine Specialist.\n' +
        'Reply 2 if you are a teen or young adult and would like to chat with a Teen and Young Adult HelpLine Specialist.\n' +
        'Reply 3 if you are a family caregiver and would like to chat with a Family Caregiver HelpLine Specialist.',
    ),
    callerStatement('1'),
    botStatement('To better help you, please share your reason for contacting the NAMI HelpLine.'),
    callerStatement('SMS E2E test'),
    counselorAutoStatement(
      'You will be connected with the next available NAMI HelpLine Specialist.',
    ),
    botStatement('You are now connected with a NAMI HelpLine Specialist.'),
    callerStatement('CALLER TEST SMS MESSAGE'),
    counselorStatement('COUNSELLOR TEST SMS MESSAGE'),
  ],
};

export const smsEnvScripts: Record<string, Record<string, ChatStatement[]>> = {
  development: {
    as: [
      callerStatement('hi'),
      botStatement("Sorry, I didn't understand that. Please try again."),
      callerStatement('hi'),
      botStatement('Are you calling about yourself? Please answer Yes or No.'),
      callerStatement('yes'),
      botStatement('How old are you?'),
      callerStatement('10'),
      botStatement('What is your gender?'),
      callerStatement('girl'),
      botStatement("We'll transfer you now. Please hold for a counsellor."),
      counselorAutoStatement('Hi, this is the counsellor. How can I help you?'),
      callerStatement('CALLER TEST SMS MESSAGE'),
      counselorStatement('COUNSELLOR TEST SMS MESSAGE'),
    ],
  },
};

export const getSmsScript = (): ChatStatement[] => {
  const helplineShortCode = getConfigValue('helplineShortCode') as string;
  const helplineEnv = getConfigValue('helplineEnv') as string;

  if (smsEnvScripts[helplineEnv]?.[helplineShortCode]) {
    return smsEnvScripts[helplineEnv][helplineShortCode];
  }

  if (smsCommonScripts[helplineShortCode]) {
    return smsCommonScripts[helplineShortCode];
  }

  return defaultSmsScript;
};
