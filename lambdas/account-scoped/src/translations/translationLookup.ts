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

import { AccountSID } from '@tech-matters/twilio-types';
import { getCurrentDefinitionVersion } from '../hrm/formDefinitionsCache';

export type TranslationMessages = Record<string, string>;

const GLOBAL_DEFAULT_LANGUAGE = 'en';

export const loadTranslationFile = (locale: string): TranslationMessages | undefined => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`./${locale}.json`) as TranslationMessages;
  } catch {
    return undefined;
  }
};

/**
 * Looks up a translation key using the following priority:
 * 1. customStrings.postSurveyMessages from the helpline's form definitions
 * 2. Account-scoped translations file matching the full task language (e.g. en-US.json)
 * 3. Account-scoped translations file matching the language portion (e.g. en.json)
 * 4. Account-scoped translations file for the global default language (en.json)
 * 5. Throws a configuration error if no translation is found
 */
export const getTranslation = async (
  accountSid: AccountSID,
  taskLanguage: string,
  key: string,
  translationLoader: (
    locale: string,
  ) => TranslationMessages | undefined = loadTranslationFile,
): Promise<string> => {
  // Step 1: Check customStrings in helpline's form definitions
  const definitionVersion = await getCurrentDefinitionVersion({ accountSid });
  const customMessage = definitionVersion.customStrings?.postSurveyMessages?.[key];
  if (customMessage) return customMessage;

  // Build ordered list of locales to try, avoiding duplicates
  const localeChain: string[] = [taskLanguage];
  const [language] = taskLanguage.split('-');
  if (language !== taskLanguage) localeChain.push(language);
  if (!localeChain.includes(GLOBAL_DEFAULT_LANGUAGE))
    localeChain.push(GLOBAL_DEFAULT_LANGUAGE);

  for (const locale of localeChain) {
    const translation = translationLoader(locale);
    if (translation?.[key]) return translation[key];
  }

  throw new Error(
    `Configuration error: no translation found for key "${key}" with language "${taskLanguage}"`,
  );
};
