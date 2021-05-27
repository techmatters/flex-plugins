import { getTranslation, getMessages } from '../services/ServerlessService';

// default language to initialize plugin
// export const defaultLanguage = 'en-US';
export const defaultLanguage = 'garbled';

const defaultTranslation = require(`../translations/${defaultLanguage}/flexUI.json`);
const defaultMessages = require(`../translations/${defaultLanguage}/messages.json`);

const translationErrorMsg = 'Could not translate, using default';

/**
 * Given localization config object, returns a function that receives a language and fetches the UI translation
 * @returns {(language: string) => Promise<void>}
 */
export const initTranslateUI = localizationConfig => async language => {
  const { twilioStrings, setNewStrings, afterNewStrings } = localizationConfig;
  try {
    if (language === defaultLanguage) {
      setNewStrings({ ...twilioStrings, ...defaultTranslation });
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
    window.alert(translationErrorMsg);
    console.error(translationErrorMsg, err);
  }
};

/**
 * Function that receives a language and a message key and fetches the appropriate message from serverless translations
 * @param {string} messageKey
 * @returns {(language: string) => Promise<string>}
 */
export const getMessage = messageKey => async language => {
  try {
    if (language && language !== defaultLanguage) {
      const body = { language };
      const messagesJSON = await getMessages(body);
      const messages = await (typeof messagesJSON === 'string'
        ? JSON.parse(messagesJSON)
        : Promise.resolve(messagesJSON));
      return messages[messageKey] ? messages[messageKey] : defaultMessages[messageKey];
    }

    return defaultMessages[messageKey];
  } catch (err) {
    window.alert(translationErrorMsg);
    console.error(translationErrorMsg, err);
    return defaultMessages[messageKey];
  }
};

/**
 * WARNING: the way this is done right now is "hacky", as it changes an object reference (setNewStrings) and then forces a re-render (afterNewStrings). The safe way of doing this would be 1) async init method 2) having access to a function that updates the ContextProvider state that wraps the entire app. A fallback is to move translations within the code (avoiding the asynchronous operation).
 *
 * Receives localization config object and initial language. Based on this, translates the UI
 * to match the counselor's preferences (if needed).
 * Returns the functions used for further localization, attaching to them the localization config object
 * @param {{ twilioStrings: any; setNewStrings: (newStrings: any) => void; afterNewStrings: (language: string) => void; }} localizationConfig
 * @param {string} initialLanguage
 */
export const initLocalization = (localizationConfig, initialLanguage) => {
  const translateUI = initTranslateUI(localizationConfig);

  const { setNewStrings } = localizationConfig;

  setNewStrings(defaultTranslation);
  if (initialLanguage && initialLanguage !== defaultLanguage) translateUI(initialLanguage);

  return {
    translateUI,
    getMessage,
  };
};
