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

import { newErr, Result } from '@tech-matters/result-type';
import { HrmContact } from '@tech-matters/hrm-types';
import { AccountSID } from '@tech-matters/twilio-types';
import { mappingFunction as uscrMappingFunction } from './uscrMappings';
import { getHelplineCode } from '@tech-matters/twilio-configuration';

export type ExternalTaskMappingFunction = (payload: {
  contact: HrmContact;
  accountSid: AccountSID;
  taskAttributes: Record<string, any>;
  // externalTaskAttributes: Record<string, any>;
}) => Promise<Result<Error, HrmContact>>;

export const getExternalTaskMappingFunction = async ({
  accountSid,
}: {
  accountSid: AccountSID;
}): Promise<ExternalTaskMappingFunction> => {
  try {
    const accountShortCode = await getHelplineCode(accountSid);
    switch (accountShortCode.toUpperCase()) {
      case 'E2E':
      case 'AS':
      case 'USCR': {
        return uscrMappingFunction;
      }
      default: {
        const message = `Mapping not defined for account short code ${accountShortCode}`;
        return async () =>
          newErr({
            message,
            error: new Error(message),
          });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return async () =>
      newErr({
        message,
        error: err instanceof Error ? err : new Error(message),
      });
  }
};
