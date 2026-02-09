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

import { TextDecoder, TextEncoder } from 'util';

import { sessionDataHandler, contactBackend } from '../sessionDataHandler';
import WebChatLogger from '../logger';
import { ConfigState } from '../store/definitions';

global.fetch = jest.fn();

const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;

const okFetchResponse = (responseBody: any) =>
  ({
    json: () => Promise.resolve(responseBody),
    ok: true,
  } as Awaited<ReturnType<typeof fetch>>);

jest.mock('../logger');

Object.assign(global, { TextDecoder, TextEncoder });
Object.defineProperty(navigator, 'mediaCapabilities', {
  writable: true,
  value: {
    decodingInfo: jest.fn().mockResolvedValue({} as unknown as MediaCapabilitiesDecodingInfo),
  },
});

const TEST_CONFIG_STATE: ConfigState = {
  quickExitUrl: 'https://mock-aselo-quickexit',
  aseloBackendUrl: 'http://mock-aselo-backend',
  deploymentKey: '',
  helplineCode: 'xx',
  translations: {},
  defaultLocale: 'en-US',
};

const originalEnv = process.env;

describe('session data handler', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'Twilio', {
      value: {
        getLogger(className: string) {
          return new WebChatLogger(className);
        },
      },
    });
    process.env = {
      ...originalEnv,
      APP_VERSION: '1.25.10',
      WEBCHAT_VERSION: '3.55',
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should set the region', () => {
    sessionDataHandler.setRegion('Foo');
    expect(sessionDataHandler.getRegion()).toBe('Foo');
  });

  it('should set the deployment key', () => {
    sessionDataHandler.setDeploymentKey('key1');
    expect(sessionDataHandler.getDeploymentKey()).toBe('key1');
  });

  describe('contactBackend', () => {
    beforeEach(() => () => {
      sessionDataHandler.setRegion('');
    });

    afterEach(() => {
      sessionDataHandler.setRegion('');
      fetchMock.mockReset();
    });

    it('should call correct stage url', async () => {
      fetchMock.mockResolvedValue(okFetchResponse({}));
      sessionDataHandler.setRegion('stage');
      await contactBackend(TEST_CONFIG_STATE)('/Webchat/Tokens/Refresh', { DeploymentKey: 'dk', token: 'token' });
      expect(fetchMock.mock.calls[0][0]).toEqual(
        `${TEST_CONFIG_STATE.aseloBackendUrl}/lambda/twilio/account-scoped/XX/Webchat/Tokens/Refresh`,
      );
    });

    it('should call correct prod url', async () => {
      const mockFetch = Promise.resolve({ ok: true, json: async () => Promise.resolve('okay') });
      const fetchSpy = jest
        .spyOn(window, 'fetch')
        .mockImplementation(async (): Promise<never> => mockFetch as Promise<never>);
      await contactBackend(TEST_CONFIG_STATE)('/Webchat/Tokens/Refresh', { DeploymentKey: 'dk', token: 'token' });
      expect(fetchSpy.mock.calls[0][0]).toEqual(
        `${TEST_CONFIG_STATE.aseloBackendUrl}/lambda/twilio/account-scoped/XX/Webchat/Tokens/Refresh`,
      );
    });
  });

  describe('fetch and store new session', () => {
    it('should throw if backend request fails', async () => {
      fetchMock.mockImplementationOnce(() => {
        throw Error('Backend failed to process the request');
      });

      await expect(sessionDataHandler.fetchAndStoreNewSession({ formData: {} })).rejects.toThrow();
    });

    it('should store new token data in local storage', async () => {
      const setLocalStorageItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');

      jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));

      const currentTime = Date.now();
      const tokenPayload = {
        expiration: `${currentTime + 10e5}`,
        token: 'new token',
        // eslint-disable-next-line camelcase
        conversation_sid: 'sid',
        identity: 'identity',
      };
      fetchMock.mockResolvedValue(okFetchResponse(tokenPayload));
      await sessionDataHandler.fetchAndStoreNewSession({ formData: {} });

      const expected = {
        ...tokenPayload,
        loginTimestamp: currentTime.toString(),
      };
      expect(setLocalStorageItemSpy).toHaveBeenCalledTimes(2);
      expect(setLocalStorageItemSpy).toHaveBeenNthCalledWith(
        1,
        'TWILIO_WEBCHAT_WIDGET',
        JSON.stringify({
          token: '',
          expiration: '',
          identity: '',
          conversationSid: '',
          loginTimestamp: currentTime.toString(),
        }),
      );
      expect(setLocalStorageItemSpy).toHaveBeenNthCalledWith(2, 'TWILIO_WEBCHAT_WIDGET', JSON.stringify(expected));
    });

    it('should return a new token', async () => {
      const tokenPayload = {
        expiration: `${Date.now() + 10e5}`,
        token: 'new token',
        // eslint-disable-next-line camelcase
        conversation_sid: 'sid',
        identity: 'identity',
      };
      fetchMock.mockResolvedValue(okFetchResponse(tokenPayload));
      const { token } = await sessionDataHandler.fetchAndStoreNewSession({ formData: {} });

      expect(token).toBe(tokenPayload.token);
    });
  });

  describe('resuming existing session', () => {
    it('should succeed trying to resume an existing session if the token is valid', () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(
        JSON.stringify({
          expiration: Date.now() + 10e5,
          token: 'token',
          conversationSid: 'sid',
        }),
      );

      const tokenPayload = sessionDataHandler.tryResumeExistingSession();

      expect(tokenPayload).not.toBeNull();
    });

    it('should fail trying to resume an existing session if the token has expired', () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(
        JSON.stringify({
          expiration: Date.now() - 10e5,
          token: 'token',
          conversationSid: 'sid',
        }),
      );

      const tokenPayload = sessionDataHandler.tryResumeExistingSession();

      expect(tokenPayload).toBeNull();
    });

    it('should fail trying to resume an existing session if the localStorage is empty', () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(null);

      const tokenPayload = sessionDataHandler.tryResumeExistingSession();

      expect(tokenPayload).toBeNull();
    });

    it('should fail trying to resume an existing session if the localStorage has badly formatted data', () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce({
        expiration: Date.now() - 10e5,
        token: 'token',
        conversationSid: 'sid',
      });

      const tokenPayload = sessionDataHandler.tryResumeExistingSession();

      expect(tokenPayload).toBeNull();
    });
  });

  describe('updating the token', () => {
    it("should throw if current token doesn't exist", async () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(null);

      await expect(sessionDataHandler.getUpdatedToken()).rejects.toThrow();
    });

    it('should throw if backend request fails', async () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(
        JSON.stringify({
          expiration: Date.now() - 10e5,
          token: 'token',
          conversationSid: 'sid',
        }),
      );
      fetchMock.mockImplementationOnce(() => {
        throw Error('Backend failed to process the request');
      });

      await expect(sessionDataHandler.getUpdatedToken()).rejects.toThrow();
    });

    it('should store new token in local storage', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2023-01-01'));

      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(
        JSON.stringify({
          expiration: Date.now() + 10e5,
          token: 'token',
          conversationSid: 'sid',
        }),
      );
      const setLocalStorageItemSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');

      const tokenPayload = {
        expiration: Date.now() + 10e5,
        token: 'new token',
        conversationSid: 'sid',
      };
      fetchMock.mockResolvedValue(okFetchResponse(tokenPayload));
      await sessionDataHandler.getUpdatedToken();

      expect(setLocalStorageItemSpy).toHaveBeenCalledWith('TWILIO_WEBCHAT_WIDGET', JSON.stringify(tokenPayload));
    });

    it('should return a new token', async () => {
      jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(
        JSON.stringify({
          expiration: Date.now() + 10e5,
          token: 'token',
          conversationSid: 'sid',
        }),
      );

      const tokenPayload = {
        expiration: Date.now() + 10e5,
        token: 'new token',
        conversationSid: 'sid',
      };
      fetchMock.mockResolvedValue(okFetchResponse(tokenPayload));
      const { token } = await sessionDataHandler.getUpdatedToken();

      expect(token).toBe(tokenPayload.token);
    });
  });

  it('should clear the token from the local storage', () => {
    const spySetItem = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem');
    jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem').mockReturnValueOnce(
      JSON.stringify({
        expiration: Date.now() + 10e5,
        token: 'token',
        conversationSid: 'sid',
        identity: 'identity',
      }),
    );
    sessionDataHandler.clear();
    expect(spySetItem).toHaveBeenCalledWith('TWILIO_WEBCHAT_WIDGET', JSON.stringify({ identity: 'identity' }));
  });

  describe('contactBackend', () => {
    it('should', async () => {
      fetchMock.mockRejectedValueOnce('ForcedFailure');

      await expect(sessionDataHandler.fetchAndStoreNewSession({ formData: {} })).rejects.toThrow(
        new Error('No results from server'),
      );
    });
  });
});
