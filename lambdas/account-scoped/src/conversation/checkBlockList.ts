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

import { AccountScopedHandler, HttpError } from '../httpTypes';
import { AccountSID } from '@tech-matters/twilio-types';
import { newErr, newOk, Result } from '../Result';
import { getBlockListKey } from '@tech-matters/twilio-configuration';
import { SsmParameterNotFound } from '@tech-matters/ssm-cache';

export type CheckBlockListRequestBody = {
  callFrom: string;
};

type BlockList = {
  numbers: string[];
};

export const checkBlockListHandler: AccountScopedHandler = async (
  { body },
  accountSid: AccountSID,
): Promise<Result<HttpError, any>> => {
  const { callFrom } = body as CheckBlockListRequestBody;

  if (!callFrom) {
    return newErr({
      message: 'callFrom parameter is missing',
      error: { statusCode: 400 },
    });
  }

  let blockListKey: string;
  try {
    blockListKey = await getBlockListKey(accountSid);
  } catch (err) {
    if (err instanceof SsmParameterNotFound) {
      // No block list configured for this account, allow the call through
      return newOk({ blocked: false });
    }
    throw err;
  }

  let blockList: BlockList;
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    blockList = require(`./blockList/${blockListKey}.json`);
  } catch {
    // No block list file found for this key, allow the call through
    return newOk({ blocked: false });
  }

  const blockListNumbers = blockList.numbers ?? [];
  const blocked = blockListNumbers.includes(callFrom);

  if (blocked) {
    return newErr({
      message: 'User is blocked.',
      error: { statusCode: 403 },
    });
  }

  return newOk({ blocked: false });
};
