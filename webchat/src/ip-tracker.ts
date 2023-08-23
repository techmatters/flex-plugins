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

import { API_KEY } from '../private/secret';

const url = `https://ipfind.co/me?auth=${API_KEY}`; // Free Tier is 100 requests/day

export const getUserIp = async (): Promise<string> => {
  const response = await fetch(url);
  const responseBody = await response.json();
  return responseBody.ip_address;
};
