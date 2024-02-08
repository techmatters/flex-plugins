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
  botStatement(
    'Welcome. To help us better serve you, please answer the following questions. Are you calling about yourself? Please answer Yes or No.',
  ),
  callerStatement('yes'),
  botStatement('How old are you?'),
  callerStatement('10'),
  botStatement('What is your gender?'),
  callerStatement('girl'),
  botStatement("We'll transfer you now. Please hold for a counsellor."),
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
