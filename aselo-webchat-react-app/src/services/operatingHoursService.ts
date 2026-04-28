/**
 * Copyright (C) 2021-2026 Technology Matters
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

type OperatingHoursStatus = 'open' | 'closed' | 'holiday';
export type OperatingHoursResponse = OperatingHoursStatus | { status: OperatingHoursStatus; message: string };

export const getOperatingHours = async (serviceUrl: string, language: string): Promise<OperatingHoursResponse> => {
  const body = {
    channel: 'webchat',
    includeMessageTextInResponse: 'true',
    language,
  };

  const options = {
    method: 'POST',
    body: new URLSearchParams(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  };

  const response = await fetch(`${serviceUrl}/operatingHours`, options);

  if (response.status === 403) {
    throw new Error('Server responded with 403 status (Forbidden)');
  }

  const responseJson = await response.json();

  if (!response.ok) {
    const errorOptions = responseJson.stack ? { cause: responseJson.stack } : null;
    console.log('Error:', errorOptions);
    throw new Error(responseJson.message);
  }

  return responseJson;
};
