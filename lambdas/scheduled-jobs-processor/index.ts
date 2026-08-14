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

import type { ALBEvent, ALBResult } from 'aws-lambda';
// import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// const ssmClient = new SSMClient({ region: 'us-east-1' });

// export const getSsmParameter = async (Name: string) => {
//   const command = new GetParameterCommand({ Name, WithDecryption: true });
//   const response = await ssmClient.send(command);
//   return response.Parameter?.Value;
// };

export const handler = async (event: ALBEvent): Promise<ALBResult> => {
  console.debug(event);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Ok' }),
  };
};
