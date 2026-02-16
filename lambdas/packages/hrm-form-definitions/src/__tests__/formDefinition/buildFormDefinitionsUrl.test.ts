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

import { buildFormDefinitionsBaseUrlGetter } from '../../formDefinition/buildFormDefinitionsUrl';

describe('buildFormDefinitionsBaseUrlGetter', () => {
  const environment = 'test-env';

  describe('with configuredFormDefinitionsBaseUrl', () => {
    it('should handle configuredFormDefinitionsBaseUrl with trailing slash', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com/definitions/',
      });

      const result = getBaseUrl('as-v1');
      expect(result).toBe('https://custom.example.com/definitions/as/v1');
    });

    it('should handle configuredFormDefinitionsBaseUrl without trailing slash', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com/definitions',
      });

      const result = getBaseUrl('as-v1');
      expect(result).toBe('https://custom.example.com/definitions/as/v1');
    });

    it('should correctly form URLs for different definition version IDs with trailing slash', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com/',
      });

      expect(getBaseUrl('as-v1')).toBe('https://custom.example.com/as/v1');
      expect(getBaseUrl('zm-v2')).toBe('https://custom.example.com/zm/v2');
      expect(getBaseUrl('demo-v1')).toBe('https://custom.example.com/as/v1');
    });

    it('should correctly form URLs for different definition version IDs without trailing slash', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com',
      });

      expect(getBaseUrl('as-v1')).toBe('https://custom.example.com/as/v1');
      expect(getBaseUrl('zm-v2')).toBe('https://custom.example.com/zm/v2');
      expect(getBaseUrl('demo-v1')).toBe('https://custom.example.com/as/v1');
    });
  });

  describe('without configuredFormDefinitionsBaseUrl (default URL)', () => {
    it('should use default URL when configuredFormDefinitionsBaseUrl is undefined', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: undefined,
      });

      const result = getBaseUrl('as-v1');
      expect(result).toBe('https://assets-test-env.tl.techmatters.org/form-definitions/as/v1');
    });

    it('should use default URL when configuredFormDefinitionsBaseUrl is not provided', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
      });

      const result = getBaseUrl('as-v1');
      expect(result).toBe('https://assets-test-env.tl.techmatters.org/form-definitions/as/v1');
    });

    it('should correctly form URLs for different definition version IDs with default URL', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
      });

      expect(getBaseUrl('as-v1')).toBe(
        'https://assets-test-env.tl.techmatters.org/form-definitions/as/v1',
      );
      expect(getBaseUrl('zm-v2')).toBe(
        'https://assets-test-env.tl.techmatters.org/form-definitions/zm/v2',
      );
      expect(getBaseUrl('demo-v1')).toBe(
        'https://assets-test-env.tl.techmatters.org/form-definitions/as/v1',
      );
      expect(getBaseUrl('v1')).toBe(
        'https://assets-test-env.tl.techmatters.org/form-definitions/zm/v1',
      );
    });
  });

  describe('URL formation edge cases', () => {
    it('should handle special case for demo-v1 definition version', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com',
      });

      const result = getBaseUrl('demo-v1');
      expect(result).toBe('https://custom.example.com/as/v1');
    });

    it('should handle special case for v1 definition version', () => {
      const getBaseUrl = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com',
      });

      const result = getBaseUrl('v1');
      expect(result).toBe('https://custom.example.com/zm/v1');
    });

    it('should not introduce double slashes in URLs', () => {
      const getBaseUrlWithSlash = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com/definitions/',
      });

      const getBaseUrlWithoutSlash = buildFormDefinitionsBaseUrlGetter({
        environment,
        configuredFormDefinitionsBaseUrl: 'https://custom.example.com/definitions',
      });

      const resultWithSlash = getBaseUrlWithSlash('as-v1');
      const resultWithoutSlash = getBaseUrlWithoutSlash('as-v1');

      expect(resultWithSlash).toBe(resultWithoutSlash);
      expect(resultWithSlash).not.toContain('//as');
      expect(resultWithoutSlash).not.toContain('//as');
    });
  });
});
