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
import { getAccountAuthToken } from '../configuration/twilioConfiguration';
import twilio from 'twilio';
import { isErr, newErr, newOk, Result } from '../Result';
import { getFromInternalHrmEndpoint } from './internalHrmRequest';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { sanitizeIdentifierFromTrigger } from './sanitizeIdentifier';

export const handleGetProfileFlagsForIdentifier: AccountScopedHandler = async (
  request,
  accountSid,
): Promise<Result<HttpError, { flags: string[] }>> => {
  try {
    const authToken = await getAccountAuthToken(accountSid);
    const { hrm_api_version: hrmApiVersion } =
      await retrieveServiceConfigurationAttributes(twilio(accountSid, authToken));
    const { trigger, channelType } = request.body;
    const identifierResult = sanitizeIdentifierFromTrigger({ trigger, channelType });
    if (isErr(identifierResult)) {
      if (identifierResult.error instanceof Error) {
        return newErr({
          message: identifierResult.message,
          error: { statusCode: 500, cause: identifierResult.error },
        });
      } else {
        return newErr({
          message: identifierResult.message,
          error: { statusCode: 400, cause: new Error(identifierResult.message) },
        });
      }
    }
    const identifier = identifierResult.unwrap();
    const profileFlagsByIdentifierPath = `profiles/identifier/${identifier}/flags`;
    console.info(
      `[${accountSid}] Getting profile flags for identifier ${identifier} from ${profileFlagsByIdentifierPath}`,
    );
    const responseResult = await getFromInternalHrmEndpoint<{ name: string }[]>(
      accountSid, // We use the accountSid rather than the hrmAccountId because we can't infer the hrmAccountSid based on worker at this point
      hrmApiVersion,
      profileFlagsByIdentifierPath,
    );
    if (isErr(responseResult)) {
      return newErr<HttpError>({
        message: `Request to HRM (${profileFlagsByIdentifierPath}) failed`,
        error: { statusCode: 500, cause: responseResult.error },
      });
    }
    const responseBody = responseResult.unwrap();
    console.info(
      `[${accountSid}] Profile flags for identifier ${identifier} from ${profileFlagsByIdentifierPath}`,
      responseBody,
    );
    return newOk({ flags: responseBody.map(flag => flag.name) });
  } catch (error: any) {
    return newErr({ message: error.message, error: { statusCode: 500, cause: error } });
  }
};
