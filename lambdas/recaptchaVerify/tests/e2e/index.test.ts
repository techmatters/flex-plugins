import { getBaseUrl } from '../../../../tests/getBaseUrl';

declare var fetch: typeof import('undici').fetch;

const url = `${getBaseUrl()}recaptchaVerify`;

describe('recaptchaVerify', () => {
  it('should return 405 when passed an empty request', async () => {
    const response = await fetch(url, {
      method: 'GET',
    });
    expect(response.status).toEqual(405);
  });
});
