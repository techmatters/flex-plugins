import { getBaseUrl } from '../../../../tests/getBaseUrl';

declare var fetch: typeof import('undici').fetch;

const url = `${getBaseUrl()}modicaWebhook`;

describe('modicaWebhook', () => {
  it('should return 200 when passed an empty request', async () => {
    const response = await fetch(url, {
      method: 'GET',
    });
    expect(response.status).toEqual(200);
  });
});
