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

import { getPostSurveyTranslation } from '../../../src/channelCapture/postSurveyTranslationLookup';
import { getCurrentDefinitionVersion } from '../../../src/hrm/formDefinitionsCache';
import type { PostSurveyMessages } from '../../../src/channelCapture/postSurveyTranslationLookup';

jest.mock('../../../src/hrm/formDefinitionsCache', () => ({
  getCurrentDefinitionVersion: jest.fn(),
}));

const mockGetCurrentDefinitionVersion =
  getCurrentDefinitionVersion as jest.MockedFunction<typeof getCurrentDefinitionVersion>;

const TEST_ACCOUNT_SID = 'AC000000000000000000000000000000';
const TEST_TRIGGER_MESSAGE_KEY = 'triggerMessage';
const CUSTOM_TRIGGER_MESSAGE = 'Custom helpline trigger message';
const EN_TRIGGER_MESSAGE = 'English trigger message';
const ES_TRIGGER_MESSAGE = 'Spanish trigger message';
const EN_US_TRIGGER_MESSAGE = 'US English trigger message';

const makeDefinitionVersion = (postSurveyMessages?: Record<string, string>) =>
  ({
    customStrings: {
      Messages: {},
      Substitutions: {},
      postSurveyMessages: postSurveyMessages ?? {},
    },
  }) as any;

const makeTranslationLoader =
  (files: Record<string, PostSurveyMessages | undefined>) =>
  (locale: string): PostSurveyMessages | undefined =>
    files[locale];

describe('getPostSurveyTranslation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Step 1: customStrings lookup', () => {
    it('returns customStrings.postSurveyMessages value when present', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(
        makeDefinitionVersion({ [TEST_TRIGGER_MESSAGE_KEY]: CUSTOM_TRIGGER_MESSAGE }),
      );
      const loader = makeTranslationLoader({});

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'en-US',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(CUSTOM_TRIGGER_MESSAGE);
    });

    it('does not use customStrings if the key is not present in postSurveyMessages', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(
        makeDefinitionVersion({ otherKey: 'other value' }),
      );
      const loader = makeTranslationLoader({
        en: { [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'en',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(EN_TRIGGER_MESSAGE);
    });

    it('proceeds to translation lookup if customStrings.postSurveyMessages is empty', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({
        en: { [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'en',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(EN_TRIGGER_MESSAGE);
    });

    it('proceeds to translation lookup if customStrings is absent', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue({
        customStrings: undefined,
      } as any);
      const loader = makeTranslationLoader({
        en: { [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'en',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(EN_TRIGGER_MESSAGE);
    });
  });

  describe('Step 2: full task language translation file', () => {
    it('returns translation from full task language file (e.g. en-US.json)', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({
        'en-US': { [TEST_TRIGGER_MESSAGE_KEY]: EN_US_TRIGGER_MESSAGE },
        en: { [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'en-US',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(EN_US_TRIGGER_MESSAGE);
    });
  });

  describe('Step 3: language portion translation file', () => {
    it('falls back to language-only file when full locale file is absent', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({
        es: { [TEST_TRIGGER_MESSAGE_KEY]: ES_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'es-CO',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(ES_TRIGGER_MESSAGE);
    });

    it('falls back to language-only file when full locale file lacks the key', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({
        'es-CO': { otherKey: 'other' },
        es: { [TEST_TRIGGER_MESSAGE_KEY]: ES_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'es-CO',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(ES_TRIGGER_MESSAGE);
    });

    it('does not duplicate locale check when taskLanguage has no region (e.g. en)', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = jest
        .fn()
        .mockReturnValue({ [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'en',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      // For 'en' without region, locale chain is ['en'] only (global default deduplication)
      expect(loader).toHaveBeenCalledTimes(1);
      expect(loader).toHaveBeenCalledWith('en');
      expect(result).toBe(EN_TRIGGER_MESSAGE);
    });
  });

  describe('Step 4: global default language (en)', () => {
    it('falls back to en.json as the global default', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({
        en: { [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'fr-CA',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(EN_TRIGGER_MESSAGE);
    });

    it('uses global default even when language-only file also has no matching key', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({
        fr: {},
        en: { [TEST_TRIGGER_MESSAGE_KEY]: EN_TRIGGER_MESSAGE },
      });

      const result = await getPostSurveyTranslation(
        TEST_ACCOUNT_SID,
        'fr-CA',
        TEST_TRIGGER_MESSAGE_KEY,
        loader,
      );

      expect(result).toBe(EN_TRIGGER_MESSAGE);
    });
  });

  describe('Error handling', () => {
    it('throws a configuration error when no translation is found anywhere', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({});

      await expect(
        getPostSurveyTranslation(
          TEST_ACCOUNT_SID,
          'fr-CA',
          TEST_TRIGGER_MESSAGE_KEY,
          loader,
        ),
      ).rejects.toThrow(/Configuration error/);
    });

    it('throws including the key and language in the error message', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = makeTranslationLoader({});

      await expect(
        getPostSurveyTranslation(
          TEST_ACCOUNT_SID,
          'fr-CA',
          TEST_TRIGGER_MESSAGE_KEY,
          loader,
        ),
      ).rejects.toThrow(`"${TEST_TRIGGER_MESSAGE_KEY}"`);
    });
  });

  describe('Locale chain deduplication', () => {
    it('does not try en twice when taskLanguage is en', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = jest.fn().mockReturnValue(undefined);

      await expect(
        getPostSurveyTranslation(
          TEST_ACCOUNT_SID,
          'en',
          TEST_TRIGGER_MESSAGE_KEY,
          loader,
        ),
      ).rejects.toThrow(/Configuration error/);

      // Should only call loader once with 'en' (deduplicated: 'en' is both taskLanguage and global default)
      expect(loader).toHaveBeenCalledTimes(1);
      expect(loader).toHaveBeenCalledWith('en');
    });

    it('tries en-US, en, and en as global default (deduplicated to en-US and en)', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = jest.fn().mockReturnValue(undefined);

      await expect(
        getPostSurveyTranslation(
          TEST_ACCOUNT_SID,
          'en-US',
          TEST_TRIGGER_MESSAGE_KEY,
          loader,
        ),
      ).rejects.toThrow(/Configuration error/);

      // en-US and en (global default is also en)
      expect(loader).toHaveBeenCalledTimes(2);
      expect(loader).toHaveBeenNthCalledWith(1, 'en-US');
      expect(loader).toHaveBeenNthCalledWith(2, 'en');
    });

    it('tries es-CO, es, and en for a region-scoped non-English language', async () => {
      mockGetCurrentDefinitionVersion.mockResolvedValue(makeDefinitionVersion({}));
      const loader = jest.fn().mockReturnValue(undefined);

      await expect(
        getPostSurveyTranslation(
          TEST_ACCOUNT_SID,
          'es-CO',
          TEST_TRIGGER_MESSAGE_KEY,
          loader,
        ),
      ).rejects.toThrow(/Configuration error/);

      expect(loader).toHaveBeenCalledTimes(3);
      expect(loader).toHaveBeenNthCalledWith(1, 'es-CO');
      expect(loader).toHaveBeenNthCalledWith(2, 'es');
      expect(loader).toHaveBeenNthCalledWith(3, 'en');
    });
  });
});
