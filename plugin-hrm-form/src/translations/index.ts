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
import { getAseloFeatureFlags, getHrmConfig } from '../hrmConfig';

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
  console.log('>>> baseLanguage', baseLanguage);  
  try {
    // Load base language translations
    let translations = {};
    try {
      translations = require(`./locales/${baseLanguage}.json`);
      console.log('>>> baseTranslations', translations);
    } catch (error) {
      console.error(`Base language file not found for ${baseLanguage}`);
    }

    // Load locale-specific overrides if they exist
    if (language !== baseLanguage) {
      const localeOverrides = require(`./locales/${language}.json`);
      console.log('>>> localeOverrides', localeOverrides);
      translations = { ...translations, ...localeOverrides };
    }

    // Load helpline-specific overrides from hrm-form-definitions
    const { helplineCode } = getHrmConfig();
    try {
      const helplineTranslations = require(`../../../hrm-form-definitions/form-definitions/${helplineCode}/v1/translations/Substitutions.json`);
      if (helplineTranslations[baseLanguage]) {
        console.log('>>> helplineTranslations', helplineTranslations[baseLanguage]);
        translations = { ...translations, ...helplineTranslations[baseLanguage] };
      }
    } catch (error) {
      console.warn(`Helpline translations not found in hrm-form-definitions for helpline: ${helplineCode}`);
    }

    return translations;
  } catch (error) {
    console.error('Error loading translations:', error);
    return {};
  }
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
  // const enableHierarchicalTranslations = true;
  try {
    let customStrings;
    if (enableHierarchicalTranslations) {
      customStrings = await loadTranslations(language);
      console.log('>>> initTranslateUI: customStrings loaded:', customStrings ? 'success' : 'null/undefined');
      
      if (!customStrings) {
        console.error(`Could not load translations for ${language}`);
        console.error(translationErrorMsg);
        return;
      }
      
      setNewStrings({ ...twilioStrings, ...customStrings });
      afterNewStrings(language);
      return;
    } else {
      console.log('>>> initTranslateUI: Using legacy translations');
      // Use legacy translations
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
        console.error(translationErrorMsg, err);
      }
    }
    
    // if (!customStrings) {
    //   console.error(translationErrorMsg);
    //   return;
    // }

    // setNewStrings({ ...twilioStrings, ...customStrings });
    // afterNewStrings(language);
  } catch (error) {
    console.log('>>> initTranslateUI: Caught error in outer try/catch:', error);
    console.error(translationErrorMsg, error);
  }
  console.log('>>> initTranslateUI: Function execution completed');
};

/**
 * Function that receives a message key and returns a function to fetch the appropriate translation.
 * If V2 translations are enabled, it will look for the message in the helpline overrides.
 * @param {string} messageKey - The key to look up in the translation files
 * @returns {(language: string) => Promise<string>} - Function that takes a language code and returns the translated message
 */
export const getMessage = messageKey => async language => {
  const { enable_hierarchical_translations: enableHierarchicalTranslations } = getAseloFeatureFlags();
  // const enableHierarchicalTranslations = true;
  try {
    if (enableHierarchicalTranslations) {
      const { helplineCode } = getHrmConfig();
      const helplineTranslations = require(`../../../hrm-form-definitions/form-definitions/${helplineCode}/v1/translations/Messages.json`);

      return helplineTranslations[language][messageKey];
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
    console.error(translationErrorMsg, err);
    return defaultMessages[messageKey];
  }
};

export const initLocalization = (localizationConfig: LocalizationConfig, initialLanguage: string) => {
  const translateUI = initTranslateUI(localizationConfig);
  const { setNewStrings } = localizationConfig;

  setNewStrings(defaultTranslation);
  
  const { enable_hierarchical_translations: enableHierarchicalTranslations } = getAseloFeatureFlags();
  // const enableHierarchicalTranslations = true;
  
  // Always call translateUI when hierarchical translations are enabled
  if (enableHierarchicalTranslations || (initialLanguage && initialLanguage !== defaultLanguage)) {
    translateUI(initialLanguage);
  } else {
    console.log('>>> translateUI NOT called because condition failed');
  }
  
  return { translateUI, getMessage };
};
