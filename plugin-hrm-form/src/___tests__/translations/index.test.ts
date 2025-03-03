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

import { loadTranslations, initLocalization } from '../../translations';

// Mock translation files at the top level
jest.mock('../../translations/locales/en.json', () => ({}), { virtual: true });
jest.mock('../../translations/locales/en-US.json', () => ({}), { virtual: true });
jest.mock('../../translations/locales/en-GB.json', () => ({}), { virtual: true });

const mockGetAseloFeatureFlags = jest.fn();
const mockGetHrmConfig = jest.fn();
const mockGetDefinitionVersions = jest.fn();

jest.mock('../../hrmConfig', () => ({
  getAseloFeatureFlags: () => mockGetAseloFeatureFlags(),
  getHrmConfig: () => mockGetHrmConfig(),
  getDefinitionVersions: () => mockGetDefinitionVersions(),
}));

describe('Hierarchical Translations', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // eslint-disable-next-line camelcase
    mockGetAseloFeatureFlags.mockReturnValue({ enable_hierarchical_translations: true });
    mockGetHrmConfig.mockReturnValue({ helplineCode: 'test' });
  });

  describe('Integration with Flex UI', () => {
    const baseTranslations = { GreetingMsg: 'Hello', GoodbyeMsg: 'Goodbye' };
    const helplineTranslations = { en: { GreetingMsg: 'Welcome to helpline' } };
    const twilioStrings = { FlexUIWelcome: 'Welcome to Flex', FlexUIGoodbye: 'Goodbye from Flex' };

    beforeEach(() => {
      mockGetDefinitionVersions.mockReturnValue({
        currentDefinitionVersion: { customStrings: { Substitutions: helplineTranslations } },
      });

      jest.isolateModules(() => {
        jest.doMock('../../translations/locales/en.json', () => baseTranslations);
      });
    });

    test('translations are properly integrated with Flex UI strings', async () => {
      let strings = { ...twilioStrings, ...helplineTranslations.en };
      const setNewStrings = jest.fn(newStrings => {
        strings = { ...strings, ...newStrings };
        return strings;
      });

      const localizationConfig = { twilioStrings, setNewStrings, afterNewStrings: jest.fn() };

      await initLocalization(localizationConfig, 'en');

      // Original Flex strings remain
      expect(strings.FlexUIWelcome).toBe('Welcome to Flex');
      expect(strings.FlexUIGoodbye).toBe('Goodbye from Flex');
      expect(strings.GreetingMsg).toBe('Welcome to helpline');
    });
  });

  describe('Base Translation Loading', () => {
    const baseTranslations = {
      GreetingMsg: 'Hello',
      GoodbyeMsg: 'Goodbye',
      HelpMsg: 'Need help?',
      error: 'Error occurred',
    };

    beforeEach(() => {
      mockGetDefinitionVersions.mockReturnValue({ currentDefinitionVersion: { customStrings: { Substitutions: {} } } });

      jest.isolateModules(() => {
        jest.doMock('../../translations/locales/en.json', () => baseTranslations);
      });
    });

    test('loads base translations when only base file exists', async () => {
      const translations = await loadTranslations('en-US');

      // Verify base translations are present expect(translations.GreetingMsg).toBe('Hello');
      expect(translations.GoodbyeMsg).toBe('Goodbye');
      expect(translations.HelpMsg).toBe('Need help?');
    });
  });

  describe('Locale-specific Translations', () => {
    const baseTranslations = { GreetingMsg: 'Hello', GoodbyeMsg: 'Goodbye', HelpMsg: 'Need help?' };

    const usLocaleTranslations = {
      GreetingMsg: 'Hi',
      HelpMsg: 'Need assistance?',
      USSpecificMsg: 'US specific message',
    };

    beforeEach(() => {
      mockGetDefinitionVersions.mockReturnValue({ currentDefinitionVersion: { customStrings: { Substitutions: {} } } });

      jest.isolateModules(() => {
        jest.doMock('../../translations/locales/en.json', () => baseTranslations);
        jest.doMock('../../translations/locales/en-US.json', () => usLocaleTranslations);
      });
    });

    test('locale translations override base translations', async () => {
      const translations = await loadTranslations('en-US');

      // Locale overrides
      expect(translations.GreetingMsg).toBe('Hi');
      expect(translations.HelpMsg).toBe('Need assistance?');

      // Base translations remain when not overridden
      expect(translations.GoodbyeMsg).toBe('Goodbye');

      // Locale-specific additions
      expect(translations.USSpecificMsg).toBe('US specific message');
    });
  });

  describe('Helpline-specific Translations', () => {
    const baseTranslations = { GreetingMsg: 'Hello', GoodbyeMsg: 'Goodbye', HelpMsg: 'Need help?' };

    const usLocaleTranslations = { GreetingMsg: 'Hi', HelpMsg: 'Need assistance?' };

    const helplineTranslations = {
      en: { GreetingMsg: 'Welcome to helpline', HelplineSpecificMsg: 'Helpline message' },
      fr: { GreetingMsg: 'Bienvenue sur le helpline', HelplineSpecificMsg: "Message de l'helpline" },
    };

    beforeEach(() => {
      mockGetDefinitionVersions.mockReturnValue({
        currentDefinitionVersion: { customStrings: { Substitutions: helplineTranslations } },
      });

      jest.isolateModules(() => {
        jest.doMock('../../translations/locales/en.json', () => baseTranslations);
        jest.doMock('../../translations/locales/en-US.json', () => usLocaleTranslations);
      });
    });

    test('helpline translations take precedence over locale and base', async () => {
      const translations = await loadTranslations('en-US');

      // Helpline-specific messages are available
      expect(translations.HelplineSpecificMsg).toBe('Helpline message');
      expect(translations.GreetingMsg).toBe('Welcome to helpline');
    });
  });
});
