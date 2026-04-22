/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { localizeKey } from '../localizeKey';

describe('localizeKey', () => {
  describe('when translations are undefined', () => {
    it('returns the key as-is when localeTranslations is undefined', () => {
      const translate = localizeKey(undefined);
      expect(translate('some.key')).toBe('some.key');
    });

    it('returns the key as-is when localeTranslations is null', () => {
      const translate = localizeKey(null as any);
      expect(translate('missing.key')).toBe('missing.key');
    });
  });

  describe('when translations are provided', () => {
    const translations = {
      'greeting.hello': 'Hello!',
      'greeting.goodbye': 'Goodbye!',
      'template.with.params': 'Hello, {{name}}!',
      'template.multiple.params': '{{first}} and {{second}}',
    };

    it('returns the translated value for a known key', () => {
      const translate = localizeKey(translations);
      expect(translate('greeting.hello')).toBe('Hello!');
    });

    it('returns a different translated value for another known key', () => {
      const translate = localizeKey(translations);
      expect(translate('greeting.goodbye')).toBe('Goodbye!');
    });

    it('returns the key itself when the key is not in translations', () => {
      const translate = localizeKey(translations);
      expect(translate('unknown.key')).toBe('unknown.key');
    });

    it('substitutes a single Mustache parameter', () => {
      const translate = localizeKey(translations);
      expect(translate('template.with.params', { name: 'World' })).toBe('Hello, World!');
    });

    it('substitutes multiple Mustache parameters', () => {
      const translate = localizeKey(translations);
      expect(translate('template.multiple.params', { first: 'Alice', second: 'Bob' })).toBe('Alice and Bob');
    });

    it('leaves unmatched Mustache placeholders empty when parameter is missing', () => {
      const translate = localizeKey(translations);
      expect(translate('template.with.params', {})).toBe('Hello, !');
    });

    it('uses the key itself as a Mustache template when translation is missing', () => {
      const translate = localizeKey(translations);
      expect(translate('Hello, {{name}}!', { name: 'World' })).toBe('Hello, World!');
    });

    it('returns the key unchanged when translations is an empty object', () => {
      const translate = localizeKey({});
      expect(translate('any.key')).toBe('any.key');
    });
  });
});
