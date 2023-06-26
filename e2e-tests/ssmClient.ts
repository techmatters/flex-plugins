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

import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

const ssmClient = new SSMClient({ region: 'us-east-1' });

export const getSsmParameter = async (Name: string) => {
  const command = new GetParameterCommand({ Name, WithDecryption: true });
  const response = await ssmClient.send(command);

  return response.Parameter?.Value;
};

export const getSsmParametersByPath = async (Path: string) => {
  const command = new GetParametersByPathCommand({ Path, WithDecryption: true });
  const response = await ssmClient.send(command);

  if (!response.Parameters) return {};

  return response.Parameters.reduce((obj: Record<string, string>, parameter) => {
    obj[parameter.Name!] = parameter.Value!;
    return obj;
  }, {});
};
