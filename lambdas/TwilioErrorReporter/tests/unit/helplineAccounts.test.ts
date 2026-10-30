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

import {
  DescribeParametersCommand,
  GetParametersCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';
import { loadHelplineAccounts } from '../../helplineAccounts';

const fakeSsmClient = (parameters: Record<string, string>) => {
  // The SDK paginator requires a real SSMClient instance, so only send is stubbed
  const client = new SSMClient({ region: 'us-east-1' });
  const send = jest.spyOn(client, 'send').mockImplementation(async (command: unknown) => {
    if (command instanceof DescribeParametersCommand) {
      return { Parameters: Object.keys(parameters).map(Name => ({ Name })) };
    }
    if (command instanceof GetParametersCommand) {
      const names = command.input.Names ?? [];
      return { Parameters: names.map(Name => ({ Name, Value: parameters[Name] })) };
    }
    throw new Error('Unexpected command');
  });
  return { client, send };
};

describe('loadHelplineAccounts', () => {
  test('maps each account SID to the environment and short helpline in its parameter', async () => {
    const { client } = fakeSsmClient({
      '/production/twilio/ACprod/short_helpline': 'zm',
      '/staging/twilio/ACstaging/short_helpline': 'EUMC',
    });

    expect(await loadHelplineAccounts(client)).toStrictEqual({
      ACprod: { environment: 'production', shortHelpline: 'ZM' },
      ACstaging: { environment: 'staging', shortHelpline: 'EUMC' },
    });
  });

  test('ignores listed parameters that do not match the short_helpline naming', async () => {
    const { client } = fakeSsmClient({
      '/production/twilio/ACprod/short_helpline': 'ZM',
      '/production/twilio/ACprod/short_helpline_old': 'XX',
      '/production/other/ACprod/short_helpline': 'XX',
    });

    expect(await loadHelplineAccounts(client)).toStrictEqual({
      ACprod: { environment: 'production', shortHelpline: 'ZM' },
    });
  });

  test('reads values in batches of at most 10 names', async () => {
    const parameters = Object.fromEntries(
      Array.from({ length: 23 }, (_, i) => [
        `/production/twilio/AC${i}/short_helpline`,
        `H${i}`,
      ]),
    );
    const { client, send } = fakeSsmClient(parameters);

    const accounts = await loadHelplineAccounts(client);

    const batchSizes = send.mock.calls
      .map(([command]) => command)
      .filter(command => command instanceof GetParametersCommand)
      .map(command => (command as GetParametersCommand).input.Names?.length);
    expect(batchSizes).toEqual([10, 10, 3]);
    expect(Object.keys(accounts)).toHaveLength(23);
  });
});
