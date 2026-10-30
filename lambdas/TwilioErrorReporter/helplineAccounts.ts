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
  GetParametersCommand,
  Parameter,
  paginateDescribeParameters,
  SSMClient,
} from '@aws-sdk/client-ssm';

export type HelplineAccount = {
  environment: string; // e.g. 'production', 'staging', 'development'
  shortHelpline: string; // e.g. 'AS', 'EUMC'
};

// Keyed by Twilio account SID
export type HelplineAccounts = Record<string, HelplineAccount>;

// Parameters are named /<environment>/twilio/<account sid>/short_helpline
const SHORT_HELPLINE_PARAMETER_NAME = /^\/([^/]+)\/twilio\/(AC[^/]+)\/short_helpline$/;

// AWS limit for GetParameters
const MAX_NAMES_PER_GET_PARAMETERS = 10;

const listShortHelplineParameterNames = async (ssm: SSMClient): Promise<string[]> => {
  const pages = paginateDescribeParameters(
    { client: ssm, pageSize: 50 }, // 50 is max allowed by AWS
    {
      ParameterFilters: [
        { Key: 'Name', Option: 'Contains', Values: ['/short_helpline'] },
      ],
    },
  );
  const names: string[] = [];
  for await (const page of pages) {
    (page.Parameters ?? []).forEach(({ Name }) => {
      if (Name && SHORT_HELPLINE_PARAMETER_NAME.test(Name)) names.push(Name);
    });
  }
  return names;
};

const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, (i + 1) * size),
  );

const getParameters = async (ssm: SSMClient, names: string[]): Promise<Parameter[]> => {
  const responses = await Promise.all(
    chunk(names, MAX_NAMES_PER_GET_PARAMETERS).map(batch =>
      ssm.send(new GetParametersCommand({ Names: batch, WithDecryption: true })),
    ),
  );
  return responses.flatMap(({ Parameters }) => Parameters ?? []);
};

const toHelplineAccountEntry = ({
  Name,
  Value,
}: Parameter): [string, HelplineAccount] | undefined => {
  const match = Name?.match(SHORT_HELPLINE_PARAMETER_NAME);
  if (!match || !Value) return undefined;
  const [, environment, accountSid] = match;
  return [accountSid, { environment, shortHelpline: Value.toUpperCase() }];
};

/**
 * Lists the short_helpline SSM parameters rather than reading one per account,
 * so the number of SSM calls stays small regardless of how many accounts there are.
 */
export const loadHelplineAccounts = async (ssm: SSMClient): Promise<HelplineAccounts> => {
  const names = await listShortHelplineParameterNames(ssm);
  const parameters = await getParameters(ssm, names);
  return Object.fromEntries(
    parameters
      .map(toHelplineAccountEntry)
      .filter((entry): entry is [string, HelplineAccount] => entry !== undefined),
  );
};
