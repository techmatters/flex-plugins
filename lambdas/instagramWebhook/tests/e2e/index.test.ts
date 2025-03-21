import { getBaseUrl } from '../../../../tests/getBaseUrl';

declare var fetch: typeof import('undici').fetch;

const url = `${getBaseUrl()}instagramWebhook`;

describe('instagramWebhook', () => {
  it('should return 200 when passed an empty GET request', async () => {
    const response = await fetch(url, {
      method: 'GET',
    });
    expect(response.status).toEqual(200);
  });
});
