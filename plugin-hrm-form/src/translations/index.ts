/* eslint-disable global-require */
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
import { Manager } from '@twilio/flex-ui';

import { getDefinitionVersions } from '../hrmConfig';

// default language to initialize plugin
export const defaultLocale = 'en-US';
const defaultLanguage = 'en';

export const loadTranslations = async (language: string): Promise<Record<string, string>> => {
  let translations = require(`./${defaultLanguage}.json`);
  const [baseLanguage] = language.split('-');

  try {
    const baseTranslations = require(`./${baseLanguage}.json`);
    translations = { ...translations, ...baseTranslations };
  } catch (error) {
    console.error(`Base language file not found for ${baseLanguage}`);
  }

  try {
    if (language !== baseLanguage) {
      const localeOverrides = require(`./${language}.json`);
      translations = { ...translations, ...localeOverrides };
    }
  } catch (error) {
    console.error(`Locale file not found for ${language}`);
  }

  const definitionVersion = getDefinitionVersions().currentDefinitionVersion;

  const helplineTranslations = definitionVersion?.customStrings?.Substitutions;
  if (helplineTranslations && helplineTranslations[baseLanguage]) {
    translations = { ...translations, ...helplineTranslations[baseLanguage] };
  }

  return translations;
};

type LocalizationConfig = {
  twilioStrings: any;
  setNewStrings: (newStrings: { [key: string]: string }) => void;
  afterNewStrings: (language: string) => void;
};

/**
 * Given localization config object, returns a function that receives a language and fetches the UI translation
 * @returns {(language: string) => Promise<void>}
 */
const initTranslateUI = (localizationConfig: LocalizationConfig) => async (language: string): Promise<void> => {
  const { twilioStrings, setNewStrings, afterNewStrings } = localizationConfig;
  try {
    const localizedMessages = await loadTranslations(language || defaultLocale);

    if (!localizedMessages || Object.keys(localizedMessages).length === 0) {
      console.error(`Could not load translations for ${language}, using default`);
      return;
    }

    const mergedStrings = { ...twilioStrings, ...localizedMessages };
    setNewStrings(mergedStrings);
    afterNewStrings(language);
  } catch (error) {
    console.error('Could not translate, using default', error);
  }
};

/**
 * Function that receives a message key and returns a function to fetch the appropriate translation.
 * If V2 translations are enabled, it will look for the message in the helpline overrides.
 * @param {string} messageKey - The key to look up in the translation files
 * @returns {(language: string) => Promise<string>} - Function that takes a language code and returns the translated message
 */
export const getMessage = messageKey => async language => {
  const defaultMessages = require(`./${defaultLanguage}.json`);

  try {
    const [baseLanguage] = language.split('-');
    const definitionVersion = getDefinitionVersions().currentDefinitionVersion;
    const localizedMessages = definitionVersion?.customStrings.Messages;
    if (!localizedMessages || !localizedMessages[baseLanguage || language]) {
      console.error('Could not load messages, using default', { messageKey, language });
      return defaultMessages[messageKey];
    }
    return localizedMessages[baseLanguage || language][messageKey];
  } catch (err) {
    console.error('Could not translate, using default', err);
    return defaultMessages[messageKey];
  }
};

export const initLocalization = (localizationConfig: LocalizationConfig, helplineLanguage: string) => {
  const translateUI = initTranslateUI(localizationConfig);
  const { setNewStrings } = localizationConfig;

  const defaultTranslation = require(`./${defaultLanguage}.json`);
  setNewStrings(defaultTranslation);

  if (helplineLanguage) {
    translateUI(helplineLanguage);
  } else {
    console.warn('Not loading custom translations', { helplineLanguage });
  }

  return { translateUI, getMessage };
};

export const lookupTranslation = (code: string, parameters: Record<string, string> = {}): string => {
  const { strings } = Manager.getInstance();
  return Handlebars.compile(strings[code] ?? code)(parameters);
};
