/**
 * Copyright (C) 2021-2025 Technology Matters
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

import { TEST_ACCOUNT_SID } from '../../testTwilioValues';
import { lambdaAlbFetch } from '../lambdaAlbFetch';

describe('randomOptionSelector endpoint', () => {
  const path = `/lambda/twilio/account-scoped/${TEST_ACCOUNT_SID}/randomOptionSelector`;

  describe('request validation', () => {
    test('should return 400 if body is not a JSON object', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: 'not a json object',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.message).toBe('Request body must be a JSON object');
    });

    test('should return 400 if body is an empty object', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.message).toBe('At least one option must be provided');
    });

    test('should return 400 if a weight is not a number', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 1,
          option2: 'not a number',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.message).toContain('Weight for option');
      expect(json.message).toContain('must be a number');
    });

    test('should return 400 if a weight is negative', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 1,
          option2: -5,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.message).toContain('must be non-negative');
    });
  });

  describe('random selection', () => {
    test('should return 200 with a single option', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          only_option: 10,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.value).toBe('only_option');
    });

    test('should return 200 with multiple options', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 50,
          option2: 50,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(['option1', 'option2']).toContain(json.value);
    });

    test('should return one of the provided options', async () => {
      // Run multiple times to ensure we get valid results
      for (let i = 0; i < 10; i++) {
        const response = await lambdaAlbFetch(path, {
          method: 'POST',
          body: JSON.stringify({
            apple: 10,
            banana: 20,
            cherry: 30,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(['apple', 'banana', 'cherry']).toContain(json.value);
      }
    });

    test('should respect weighting probabilities', async () => {
      // Run many times to verify weighting
      const results: Record<string, number> = {};
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const response = await lambdaAlbFetch(path, {
          method: 'POST',
          body: JSON.stringify({
            heavy: 90,
            light: 10,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const json = await response.json();
        results[json.value] = (results[json.value] || 0) + 1;
      }

      // Heavy should be selected ~90% of the time, Light ~10%
      const heavyPercentage = (results['heavy'] || 0) / iterations;
      const lightPercentage = (results['light'] || 0) / iterations;

      // Allow for statistical variance (±10%)
      expect(heavyPercentage).toBeGreaterThan(0.8);
      expect(heavyPercentage).toBeLessThan(1.0);
      expect(lightPercentage).toBeGreaterThan(0.0);
      expect(lightPercentage).toBeLessThan(0.2);
    });

    test('should handle zero weights for some options', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          selected: 100,
          never_selected: 0,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.value).toBe('selected');
    });
  });

  describe('response format', () => {
    test('should return response with value property', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 1,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json).toHaveProperty('value');
      expect(typeof json.value).toBe('string');
    });
  });
});
