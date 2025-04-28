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
import { getMessages, getTranslation } from '../services/ServerlessService';
import { getAseloFeatureFlags, getHrmConfig, getDefinitionVersions } from '../hrmConfig';

// default language to initialize plugin
export const defaultLanguage = 'en-US';

const defaultTranslation = require(`./${defaultLanguage}/flexUI.json`);
const defaultMessages = require(`./${defaultLanguage}/messages.json`);

const enCATranslation = require(`./en-CA/flexUI.json`);
const enCAMessages = require(`./en-CA/messages.json`);

const enINTranslation = require(`./en-IN/flexUI.json`);
const enINMessages = require(`./en-IN/messages.json`);

const enJMTranslation = require(`./en-JM/flexUI.json`);
const enJMMessages = require(`./en-JM/messages.json`);

const enMTTranslation = require(`./en-MT/flexUI.json`);
const enMTMessages = require(`./en-MT/messages.json`);

const enNZTranslation = require(`./en-NZ/flexUI.json`);
const enNZMessages = require(`./en-NZ/messages.json`);

const enSGTranslation = require(`./en-SG/flexUI.json`);
const enSGMessages = require(`./en-SG/messages.json`);

const enUSCRTranslation = require(`./en-USCR/flexUI.json`);
const enUSCRMessages = require(`./en-USCR/messages.json`);

const esCLTranslation = require(`./es-CL/flexUI.json`);
const esCLMessages = require(`./es-CL/messages.json`);

const esCOTranslation = require(`./es-CO/flexUI.json`);
const esCOMessages = require(`./es-CO/messages.json`);

const esESTranslation = require(`./es-ES/flexUI.json`);
const esESMessages = require(`./es-ES/messages.json`);

const huHUTranslation = require(`./hu-HU/flexUI.json`);
const huHUMessages = require(`./hu-HU/messages.json`);

const ptBRTranslation = require(`./pt-BR/flexUI.json`);
const ptBRMessages = require(`./pt-BR/messages.json`);

const thTHTranslation = require(`./th-TH/flexUI.json`);
const thTHMessages = require(`./th-TH/messages.json`);

const bundledTranslations = {
  [defaultLanguage]: defaultTranslation,
  'en-CA': enCATranslation,
  'en-IN': enINTranslation,
  'en-JM': enJMTranslation,
  'en-MT': enMTTranslation,
  'en-NZ': enNZTranslation,
  'en-SG': enSGTranslation,
  'en-USCR': enUSCRTranslation,
  'es-CL': esCLTranslation,
  'es-CO': esCOTranslation,
  'es-ES': esESTranslation,
  'hu-HU': huHUTranslation,
  'pt-BR': ptBRTranslation,
  'th-TH': thTHTranslation,
};

const bundledMessages = {
  [defaultLanguage]: defaultMessages,
  'en-CA': enCAMessages,
  'en-IN': enINMessages,
  'en-JM': enJMMessages,
  'en-MT': enMTMessages,
  'en-NZ': enNZMessages,
  'en-SG': enSGMessages,
  'en-USCR': enUSCRMessages,
  'es-CL': esCLMessages,
  'es-CO': esCOMessages,
  'es-ES': esESMessages,
  'hu-HU': huHUMessages,
  'pt-BR': ptBRMessages,
  'th-TH': thTHMessages,
};

export const loadTranslations = async (language: string): Promise<Record<string, string>> => {
  const [baseLanguage] = language.split('-');
  let translations = {};

  try {
    const baseTranslations = require(`./locales/${baseLanguage}.json`);
    translations = { ...baseTranslations };
  } catch (error) {
    console.error(`Base language file not found for ${baseLanguage}`);
  }

  try {
    if (language !== baseLanguage) {
      const localeOverrides = require(`./locales/${language}.json`);
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

const translationErrorMsg = 'Could not translate, using default';

type LocalizationConfig = {
  twilioStrings: any;
  setNewStrings: (newStrings: { [key: string]: string }) => void;
  afterNewStrings: (language: string) => void;
};

/**
 * Given localization config object, returns a function that receives a language and fetches the UI translation
 * @returns {(language: string) => Promise<void>}
 */
export const initTranslateUI = (localizationConfig: LocalizationConfig) => async (language: string): Promise<void> => {
  const { twilioStrings, setNewStrings, afterNewStrings } = localizationConfig;
  const { enable_hierarchical_translations: enableHierarchicalTranslations } = getAseloFeatureFlags();
  try {
    if (enableHierarchicalTranslations) {
      const localizedMessages = await loadTranslations(language || defaultLanguage);

      if (!localizedMessages || Object.keys(localizedMessages).length === 0) {
        console.error(`Could not load translations for ${language}, using default`);
        return;
      }

      const mergedStrings = { ...twilioStrings, ...localizedMessages };
      setNewStrings(mergedStrings);
      afterNewStrings(language);
      return;
    }

    // legacy translations logic
    try {
      if (language in bundledTranslations) {
        const translation = bundledTranslations[language];
        setNewStrings({ ...twilioStrings, ...translation });
      } else {
        const body = { language };
        const translationJSON = await getTranslation(body);
        const translation = await (typeof translationJSON === 'string'
          ? JSON.parse(translationJSON)
          : Promise.resolve(translationJSON));
        setNewStrings(translation);
      }
      afterNewStrings(language);
    } catch (err) {
      console.error('Could not translate, using default', err);
    }
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
  const { enable_hierarchical_translations: enableHierarchicalTranslations } = getAseloFeatureFlags();

  try {
    if (enableHierarchicalTranslations) {
      const [baseLanguage] = language.split('-');
      
      const definitionVersion = getDefinitionVersions().currentDefinitionVersion;
      const localizedMessages = definitionVersion?.customStrings.Messages;
      return localizedMessages[baseLanguage || language][messageKey];
    }
    if (!language) return defaultMessages[messageKey];

    if (language in bundledMessages) return bundledMessages[language][messageKey];

    // If no translation for this language, try to fetch it
    const body = { language };
    const messagesJSON = await getMessages(body);
    const messages = await (typeof messagesJSON === 'string'
      ? JSON.parse(messagesJSON)
      : Promise.resolve(messagesJSON));
    if (messages[messageKey]) return messages[messageKey];

    return defaultMessages[messageKey];
  } catch (err) {
    console.error('Could not translate, using default', err);
    return defaultMessages[messageKey];
  }
};

export const initLocalization = (localizationConfig: LocalizationConfig, helplineLanguage: string) => {
  const translateUI = initTranslateUI(localizationConfig);
  const { setNewStrings } = localizationConfig;

  // TODO: reimplement defaultTranslation to use locale/en.json after deprecating legacy implementation
  setNewStrings(defaultTranslation);

  const { enable_hierarchical_translations: enableHierarchicalTranslations } = getAseloFeatureFlags();

  const shouldLoadCustomTranslations =
    enableHierarchicalTranslations || (helplineLanguage && helplineLanguage !== defaultLanguage);

  if (shouldLoadCustomTranslations) {
    translateUI(helplineLanguage);
  } else {
    console.warn('Not loading custom translations', { enableHierarchicalTranslations, helplineLanguage });
  }

  return { translateUI, getMessage };
};
