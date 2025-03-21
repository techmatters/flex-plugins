import { getBaseUrl } from '../../../../tests/getBaseUrl';

declare var fetch: typeof import('undici').fetch;

const url = `${getBaseUrl()}facebookSignin`;

describe('facebookSignin', () => {
  it('should return 400 if queryStringParameters are not present or some of them are missing in the request payload', async () => {
    const response = await fetch(url, {
      method: 'GET',
    });
    expect(response.status).toEqual(400);
  });
});
