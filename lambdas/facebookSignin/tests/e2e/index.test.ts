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

const url = `${process.env.LAMBDAS_TEST_BASE_URL || 'https://hrm-development.tl.techmatters.org/lambda/'}facebookSignin`;

describe('facebookSignin', () => {
  it('should return 400 if queryStringParameters are not present or some of them are missing in the request payload', async () => {
    const response = await fetch(url, {
      method: 'GET',
    });
    expect(response.status).toEqual(400);
  });
});
