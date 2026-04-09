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

import { validateUser } from '../recaptchaValidation';

const VERIFY_URL = 'https://hrm-test.tl.techmatters.org/lambda/recaptchaVerify';

describe('validateUser', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns true when the server responds with { success: true }', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true, message: 'reCAPTCHA verified successfully' }),
    } as any);

    const result = await validateUser('valid-token', VERIFY_URL);

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      VERIFY_URL,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: 'valid-token' }),
      }),
    );
  });

  it('returns false when the server responds with { success: false }', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, message: 'Error: Invalid reCAPTCHA response' }),
    } as any);

    const result = await validateUser('bad-token', VERIFY_URL);

    expect(result).toBe(false);
  });

  it('returns false when the fetch call throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await validateUser('some-token', VERIFY_URL);

    expect(result).toBe(false);
  });

  it('sends the token as JSON body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    } as any);

    await validateUser('my-captcha-token', VERIFY_URL);

    const call = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(call[1].body);
    expect(body).toEqual({ response: 'my-captcha-token' });
  });
});
