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

// import { RECAPTCHA_VERIFY_URL } from '../../private/secret';

export async function validateUser(token: string) {
  try {
    // eslint-disable-next-line global-require
    const { RECAPTCHA_VERIFY_URL } = require('../../../private/secret');
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `response=${token}`,
    });
    const data = await response.json();

    if (data.success) {
      return true;
    }
    return false;
  } catch (error) {
    console.log('>>> error', error);
    return false;
  }
}
