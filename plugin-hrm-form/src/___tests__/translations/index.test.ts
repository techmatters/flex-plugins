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

import { initTranslateUI, getMessage, initLocalization, defaultLanguage } from '../../translations';
import { getAseloFeatureFlags } from '../../hrmConfig';
import { FeatureFlags } from '../../types/types';

jest.mock('../../hrmConfig');

console.log = jest.fn();
console.error = jest.fn();

const mockGetAseloFeatureFlags = getAseloFeatureFlags as jest.Mock;

mockGetAseloFeatureFlags.mockReturnValue(
  // eslint-disable-next-line camelcase
  { enable_translations_v2: true } as FeatureFlags,
);

const defaultTranslation = require(`../../translations/${defaultLanguage}/flexUI.json`);
const defaultMessages = require(`../../translations/${defaultLanguage}/messages.json`);

const esTranslation = { 'CallType-child': 'Menor llamando por si mismo' };
const esMessages = {
  WelcomeMsg: 'Hola, soy el consejero. ¿Como puedo ayudarte?',
  GoodbyeMsg: 'El consejero abandonó el chat.',
};

const mockTranslations = {
  [defaultLanguage]: { flexUI: defaultTranslation, messages: defaultMessages },
  es: { flexUI: esTranslation, messages: esMessages },
};

jest.mock('../../services/ServerlessService', () => ({
  getTranslation: jest.fn(async body => {
    if (mockTranslations[body.language]) return JSON.stringify(mockTranslations[body.language].flexUI);
    throw new Error('404 translation not found');
  }),
  getMessages: jest.fn(async body => {
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

describe('Test getMessage', () => {
  test('Default language', async () => {
    const welcomeMsg = await getMessage('WelcomeMsg')(defaultLanguage);
    expect(welcomeMsg).toStrictEqual(defaultMessages.WelcomeMsg);

    const goodbyeMsg = await getMessage('GoodbyeMsg')(defaultLanguage);
    expect(goodbyeMsg).toStrictEqual(defaultMessages.GoodbyeMsg);
  });

  test('Non default language', async () => {
    const welcomeMsg = await getMessage('WelcomeMsg')('es');
    expect(welcomeMsg).toStrictEqual(esMessages.WelcomeMsg);

    const goodbyeMsg = await getMessage('GoodbyeMsg')('es');
    expect(goodbyeMsg).toStrictEqual(esMessages.GoodbyeMsg);
  });

  test('Expect default (non existing translation)', async () => {
    const welcomeMsg = await getMessage('WelcomeMsg')('non existing');
    expect(welcomeMsg).toStrictEqual(defaultMessages.WelcomeMsg);

    const goodbyeMsg = await getMessage('GoodbyeMsg')('non existing');
    expect(goodbyeMsg).toStrictEqual(defaultMessages.GoodbyeMsg);
  });
});

strings = { ...twilioStrings };
describe('Test initLocalization', () => {
  afterEach(() => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_translations_v2: false } as FeatureFlags);
  });

  test('Default language', () => {
    const unused = initLocalization(localizationConfig, defaultLanguage);

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).not.toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });

  test('Default language with translations v2 enabled', () => {
    mockGetAseloFeatureFlags.mockReturnValue({ enable_translations_v2: true } as FeatureFlags);
    const unused = initLocalization(localizationConfig, defaultLanguage);

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation });
  });

  test('Non default language', async () => {
    const unused = initLocalization(localizationConfig, 'es');

    await Promise.resolve(); // await inner call to translateUI
    await Promise.resolve(); // await inner call to getTranslation (nested in translateUI)

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation, ...esTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });

  test('Expect default (non existing translation)', async () => {
    const unused = initLocalization(localizationConfig, 'non existing');

    await Promise.resolve(); // await inner call to translateUI
    await Promise.resolve(); // await inner call to getTranslation (nested in translateUI)

    expect(strings).toStrictEqual({ ...twilioStrings, ...defaultTranslation });
    expect(setNewStrings).toHaveBeenCalled();
    expect(afterNewStrings).not.toHaveBeenCalled();
    setNewStrings.mockClear();
    afterNewStrings.mockClear();
  });
});
