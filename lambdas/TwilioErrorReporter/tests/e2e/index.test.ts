import { getBaseUrl } from '../../../../tests/getBaseUrl';

declare var fetch: typeof import('undici').fetch;

const url = `${getBaseUrl()}TwilioErrorReporter`;

describe('TwilioErrorReporter', () => {
  it('should return 400 if passed an empty request', async () => {
    const response = await fetch(url, {
      method: 'GET',
    });
    expect(response.status).toEqual(400);
  });
});
