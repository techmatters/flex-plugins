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

import { LOCALSTORAGE_SESSION_ITEM_ID } from '../sessionDataHandler';
import { LocalStorageUtil } from './LocalStorage';

const HEADER_SEC_DECODER = 'x-twilio-sec-decoders';
const HEADER_SEC_USERSETTINGS = 'x-twilio-sec-usersettings';
const HEADER_SEC_WEBCHAT = 'x-twilio-sec-webchatinfo';
const HEADER_APP_VERSION = 'ui-version';
const HEADER_WEBCHAT_VERSION = 'webchat-version';

type SecurityHeadersType = {
  [HEADER_SEC_USERSETTINGS]: string;
  [HEADER_SEC_WEBCHAT]: string;
  [HEADER_SEC_DECODER]: string;
};

type MixPanelHeadersType = {
  [HEADER_APP_VERSION]: string;
  [HEADER_WEBCHAT_VERSION]: string;
};

type MediaCapabilitiesInfo = MediaCapabilitiesDecodingInfo | MediaCapabilitiesEncodingInfo;

export const DEFAULT_NAVIGATOR_LANG = 'en_IN';
export const DEFAULT_COOKIE_ENABLED = false;
export const DEFAULT_LOGIN_TIMESTAMP = '9999999';
const DEFAULT_CODEC_INFO = {
  powerEfficient: false,
  smooth: false,
  supported: false,
  keySystemAccess: 'twilio-keySystemAccess',
} as MediaCapabilitiesInfo;

const getUserSpecificSettings = () => {
  return {
    language: navigator.language ?? DEFAULT_NAVIGATOR_LANG,
    cookieEnabled: navigator.cookieEnabled ?? DEFAULT_COOKIE_ENABLED,
    userTimezone: new Date().getTimezoneOffset(),
  };
};

const getWebchatInfo = () => {
  const sessionStorage = LocalStorageUtil.get(LOCALSTORAGE_SESSION_ITEM_ID) ?? '';
  return {
    loginTimestamp: sessionStorage?.loginTimestamp || DEFAULT_LOGIN_TIMESTAMP,
  };
};

let audio: MediaCapabilitiesInfo = DEFAULT_CODEC_INFO;
let video: MediaCapabilitiesInfo = DEFAULT_CODEC_INFO;

const getAudioVideoDecoders = async () => {
  const audioDecoder = navigator.mediaCapabilities?.decodingInfo({
    type: 'file',
    audio: {
      contentType: 'audio/mp3',
      channels: '2',
      bitrate: 132700,
      samplerate: 5200,
    },
  });
  const videoDecoder = navigator.mediaCapabilities?.decodingInfo({
    type: 'file',
    audio: {
      contentType: 'audio/mp4',
      channels: '2',
      bitrate: 132700,
      samplerate: 5200,
    },
  });
  const [audioCapabilitiesResult, videoCapabilitiesResult]: Array<PromiseSettledResult<MediaCapabilitiesInfo>> =
    await Promise.allSettled([audioDecoder, videoDecoder]);

  if (audioCapabilitiesResult.status === 'fulfilled' && Boolean(audioCapabilitiesResult.value)) {
    audio = audioCapabilitiesResult.value;
  }

  if (videoCapabilitiesResult.status === 'fulfilled' && Boolean(videoCapabilitiesResult.value)) {
    video = videoCapabilitiesResult.value;
  }
};

getAudioVideoDecoders().then(() => null);

export const generateSecurityHeaders = (): SecurityHeadersType => {
  const headers = {} as SecurityHeadersType;
  headers[HEADER_SEC_WEBCHAT] = JSON.stringify(getWebchatInfo());
  headers[HEADER_SEC_USERSETTINGS] = JSON.stringify(getUserSpecificSettings());
  headers[HEADER_SEC_DECODER] = JSON.stringify({ audio, video });

  return headers;
};

export const generateMixPanelHeaders = (): MixPanelHeadersType => {
  return {
    [HEADER_APP_VERSION]: process.env.APP_VERSION ?? '1.0.0',
    [HEADER_WEBCHAT_VERSION]: process.env.WEBCHAT_VERSION ?? '',
  };
};
