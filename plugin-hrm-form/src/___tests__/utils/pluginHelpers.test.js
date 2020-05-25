import { initTranslateUI, initGetGoodbyeMsg, initLocalization, defaultLanguage } from '../../utils/pluginHelpers';

console.log = jest.fn();
console.error = jest.fn();

const defaultTranslation = require(`../../translations/${defaultLanguage}/flexUI.json`);
const defaultMessages = require(`../../translations/${defaultLanguage}/messages.json`);

const esTranslation = { 'CallType-child': 'Menor llamando por si mismo' };
const esMessages = { GoodbyeMsg: 'El consejero abandonó el chat.' };

const mockTranslations = {
  [defaultLanguage]: { flexUI: defaultTranslation, messages: defaultMessages },
  es: { flexUI: esTranslation, messages: esMessages },
};

jest.mock('../../services/ServerlessService', () => ({
  getTranslation: jest.fn(async (config, body) => {
    if (mockTranslations[body.language]) return JSON.stringify(mockTranslations[body.language].flexUI);
    throw new Error('404 translation not found');
  }),
  getMessages: jest.fn(async (config, body) => {
    if (mockTranslations[body.language]) return JSON.stringify(mockTranslations[body.language].messages);
    throw new Error('404 translation not found');
  }),
}));

const twilioStrings = { FakeTwilioString: 'FakeTwilioString' };
let strings = { ...twilioStrings };

const setNewStrings = jest.fn(newStrings => (strings = { ...strings, ...newStrings }));
const afterNewStrings = jest.fn();

const localizationConfig = {
  twilioStrings,
  serverlessBaseUrl: '',
  getSsoToken: jest.fn(),
  setNewStrings,
  afterNewStrings,
};

describe('Test initTranslateUI', () => {
  const translateUI = initTranslateUI(localizationConfig);

  test('Default language', async () => {
    await translateUI(defaultLanguage);

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });

  test('Non default language', async () => {
    await translateUI('es');

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation, ...esTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });

  test('Expect error (non existing translation)', async () => {
    await translateUI('non existing');

    expect(setNewStrings).not.toHaveBeenCalled();
    expect(afterNewStrings).not.toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });
});

describe('Test initGetGoodbyeMsg', () => {
  const getGoodbyeMsg = initGetGoodbyeMsg(localizationConfig);

  test('Default language', async () => {
    const goodbyeMsg = await getGoodbyeMsg(defaultLanguage);

    expect(goodbyeMsg).toStrictEqual(defaultMessages.GoodbyeMsg);
  });

  test('Non default language', async () => {
    const goodbyeMsg = await getGoodbyeMsg('es');

    expect(goodbyeMsg).toStrictEqual(esMessages.GoodbyeMsg);
  });

  test('Expect default (non existing translation)', async () => {
    const goodbyeMsg = await getGoodbyeMsg('non existing');

    expect(goodbyeMsg).toStrictEqual(defaultMessages.GoodbyeMsg);
  });
});

strings = { ...twilioStrings };
describe('Test initLocalization', () => {
  test('Default language', () => {
    const { translateUI, getGoodbyeMsg } = initLocalization(localizationConfig, defaultLanguage);

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).not.toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });

  test('Non default language', async () => {
    const { translateUI, getGoodbyeMsg } = initLocalization(localizationConfig, 'es');

    await Promise.resolve(); // await inner call to translateUI
    await Promise.resolve(); // await inner call to getTranslation (nested in translateUI)

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation, ...esTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });

  test('Expect default (non existing translation)', async () => {
    const { translateUI, getGoodbyeMsg } = initLocalization(localizationConfig, 'non existing');

    await Promise.resolve(); // await inner call to translateUI
    await Promise.resolve(); // await inner call to getTranslation (nested in translateUI)

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).not.toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });
});
