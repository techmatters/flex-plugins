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

import { AccountScopedHandler, HttpError } from './httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { newErr, newOk, Result } from './Result';

/**
 * Selects a random option from the provided options based on their weights.
 * Each option has an associated numeric weight that determines the probability
 * of it being selected relative to the other options.
 *
 * @param optionWeights Record of option names to their numeric weights
 * @returns The selected option name
 */
const selectRandomOption = (optionWeights: Record<string, number>): string => {
  const optionEntries = Object.entries(optionWeights);

  // Calculate total weight
  const totalWeight = optionEntries.reduce((sum, [, weight]) => sum + weight, 0);

  if (totalWeight <= 0) {
    throw new Error('At least one option must have a positive weight');
  }

  // Generate random value between 0 and totalWeight
  let randomValue = Math.random() * totalWeight;

  // Find the selected option
  for (const [option, weight] of optionEntries) {
    randomValue -= weight;
    if (randomValue <= 0) {
      return option;
    }
  }

  // Fallback (should not happen, but just in case)
  return optionEntries[optionEntries.length - 1][0];
};

export const randomOptionSelectorHandler: AccountScopedHandler = async (
  { body },
  _accountSid: AccountSID,
): Promise<Result<HttpError, any>> => {
  try {
    if (!body || typeof body !== 'object') {
      return newErr({
        message: 'Request body must be a JSON object',
        error: { statusCode: 400 },
      });
    }

    const optionWeights = body;
    const optionNames = Object.keys(optionWeights);

    if (optionNames.length === 0) {
      return newErr({
        message: 'At least one option must be provided',
        error: { statusCode: 400 },
      });
    }

    // Validate that all values are numbers and non-negative
    for (const [name, weight] of Object.entries(optionWeights)) {
      if (typeof weight !== 'number') {
        return newErr({
          message: `Weight for option '${name}' must be a number, got ${typeof weight}`,
          error: { statusCode: 400 },
        });
      }
      if (weight < 0) {
        return newErr({
          message: `Weight for option '${name}' must be non-negative, got ${weight}`,
          error: { statusCode: 400 },
        });
      }
    }

    // Check if at least one weight is positive
    const hasPositiveWeight = Object.values(optionWeights).some((weight: any) => weight > 0);
    if (!hasPositiveWeight) {
      return newErr({
        message: 'At least one option must have a positive weight',
        error: { statusCode: 400 },
      });
    }

    const selectedOption = selectRandomOption(optionWeights);
    return newOk({ value: selectedOption });
  } catch (error: any) {
    return newErr({
      message: error.message,
      error: { statusCode: 500, cause: error },
    });
  }
};
