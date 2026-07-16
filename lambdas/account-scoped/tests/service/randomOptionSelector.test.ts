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

import { TEST_ACCOUNT_SID } from '../testTwilioValues';
import { lambdaAlbFetch } from './lambdaAlbFetch';

describe('randomOptionSelector endpoint', () => {
  const path = `/lambda/twilio/account-scoped/${TEST_ACCOUNT_SID}/randomOptionSelector`;

  describe('request validation', () => {
    test('should return 400 if body is not a JSON object (string)', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify('just a string'),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(400);
      const json = (await response.json()) as Record<string, any>;
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
      const json = (await response.json()) as Record<string, any>;
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
      const json = (await response.json()) as Record<string, any>;
      expect(json.message).toContain('Weight for option');
      expect(json.message).toContain('must be a finite number');
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
      const json = (await response.json()) as Record<string, any>;
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
      const json = (await response.json()) as Record<string, any>;
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
      const json = (await response.json()) as Record<string, any>;
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
        const json = (await response.json()) as Record<string, any>;
        expect(['apple', 'banana', 'cherry']).toContain(json.value);
      }
    });

    test('should select option deterministically based on mocked random value', async () => {
      // Mock Math.random to return 0.5 (middle of the range: 0-1)
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 50, // 50% chance (0-50)
          option2: 50, // 50% chance (50-100)
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as Record<string, any>;
      // With random value of 0.5 and total weight of 100, randomValue starts at 50
      // First iteration: 50 - 50 = 0, so option1 should be selected
      expect(json.value).toBe('option1');

      randomSpy.mockRestore();
    });

    test('should select second option when random falls in its range', async () => {
      // Mock Math.random to return 0.6 (60% of total range)
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.6);

      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 50, // 0-50
          option2: 50, // 50-100
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as Record<string, any>;
      // With random value of 0.6 and total weight of 100, randomValue starts at 60
      // First iteration: 60 - 50 = 10, continue
      // Second iteration: 10 - 50 < 0, so option2 should be selected
      expect(json.value).toBe('option2');

      randomSpy.mockRestore();
    });

    test('should respect unequal weights with mocked random', async () => {
      // Mock Math.random to return 0.95 (95% of total range)
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.95);

      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          heavy: 90, // 0-90 (90% chance)
          light: 10, // 90-100 (10% chance)
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const json = (await response.json()) as Record<string, any>;
      // With random value of 0.95 and total weight of 100, randomValue starts at 95
      // First iteration: 95 - 90 = 5, continue
      // Second iteration: 5 - 10 < 0, so light should be selected
      expect(json.value).toBe('light');

      randomSpy.mockRestore();
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
      const json = (await response.json()) as Record<string, any>;
      expect(json.value).toBe('selected');
    });

    test('should return 400 if all weights are zero', async () => {
      const response = await lambdaAlbFetch(path, {
        method: 'POST',
        body: JSON.stringify({
          option1: 0,
          option2: 0,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(400);
      const json = (await response.json()) as Record<string, any>;
      expect(json.message).toBe('At least one option must have a positive weight');
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
      const json = (await response.json()) as Record<string, any>;
      expect(json).toHaveProperty('value');
      expect(typeof json.value).toBe('string');
    });
  });
});
