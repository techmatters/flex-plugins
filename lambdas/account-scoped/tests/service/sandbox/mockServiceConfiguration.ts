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

import { mockttpServer } from './mockingProxy';
import 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { AccountSID } from '../../../src/twilioTypes';
import { ConfigurationInstance } from 'twilio/lib/rest/flexApi/v1/configuration';

// https://flex-api.twilio.com/v1/Configuration

let priority = 0;

type ConfigurationResource = Partial<
  ConstructorParameters<typeof ConfigurationInstance>[1]
> & { account_sid: AccountSID };

const mockConfigs: Record<AccountSID, ConfigurationResource> = {};

export const initialiseMockServiceConfigurationApi = async () => {
  const server = await mockttpServer();
  await server
    .forGet(`https://flex-api.twilio.com/v1/Configuration`)
    .always()
    .asPriority(++priority) // This is to ensure the latest mock is the one that is used
    .thenCallback(async req => {
      const authHeaderValue = Array.isArray(req.headers.authorization)
        ? req.headers.authorization[0]
        : req.headers.authorization;
      if (!authHeaderValue) {
        return {
          status: 401,
          json: { message: 'Unauthorized' },
        };
      }
      const decoded = Buffer.from(authHeaderValue.split(' ')[1], 'base64').toString();
      const accountSid = decoded.split(':')[0] as AccountSID;
      if (mockConfigs[accountSid]) {
        return {
          status: 200,
          json: mockConfigs[accountSid],
        };
      } else {
        return {
          status: 401,
          json: { message: 'Unauthorized' },
        };
      }
    });
};

export async function mockServiceConfiguration(
  accountConfiguration: ConfigurationResource,
): Promise<void> {
  const { account_sid: accountSid } = accountConfiguration;
  mockConfigs[accountSid] = Object.assign(
    mockConfigs[accountSid] || {},
    accountConfiguration,
  );
}
