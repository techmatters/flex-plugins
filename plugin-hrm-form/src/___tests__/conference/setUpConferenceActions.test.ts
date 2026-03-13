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

/* eslint-disable camelcase */

import * as Flex from '@twilio/flex-ui';

import { getAseloFeatureFlags, getHrmConfig } from '../../hrmConfig';
import { setUpConferenceActions } from '../../conference/setUpConferenceActions';

jest.mock('../../transfer/setUpTransferActions', () => ({
  TransfersNotifications: {
    CantHangTransferInProgressNotification: 'TransfersNotifications_CantHangTransferInProgressNotification',
  },
}));

jest.mock('@twilio/flex-ui', () => ({
  Actions: {
    addListener: jest.fn(),
  },
  Notifications: {
    registerNotification: jest.fn(),
    showNotificationSingle: jest.fn(),
  },
  NotificationType: { error: 'error' },
  Template: jest.fn(),
}));

jest.mock('../../hrmConfig', () => ({
  getAseloFeatureFlags: jest.fn(),
  getHrmConfig: jest.fn(),
}));

jest.mock('../../transfer/transferTaskState', () => ({
  hasTaskControl: jest.fn(),
  isTransferring: jest.fn(),
}));

const mockGetAseloFeatureFlags = getAseloFeatureFlags as jest.MockedFunction<typeof getAseloFeatureFlags>;
const mockGetHrmConfig = getHrmConfig as jest.MockedFunction<typeof getHrmConfig>;
const mockAddListener = Flex.Actions.addListener as jest.MockedFunction<typeof Flex.Actions.addListener>;
const mockShowNotificationSingle = Flex.Notifications.showNotificationSingle as jest.MockedFunction<
  typeof Flex.Notifications.showNotificationSingle
>;

const { hasTaskControl, isTransferring } = jest.requireMock('../../transfer/transferTaskState');

const listeners: Record<string, ((...args: any[]) => any)[]> = {};

const captureListeners = () => {
  mockAddListener.mockImplementation((eventName: string, cb: (...args: any[]) => any) => {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(cb);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(listeners).forEach(k => delete listeners[k]);
  mockGetHrmConfig.mockReturnValue({ accountScopedLambdaBaseUrl: 'https://lambda.example.com' } as any);
  captureListeners();
});

const triggerListener = (eventName: string, ...args: any[]) => {
  const cbs = listeners[eventName] ?? [];
  return Promise.all(cbs.map(cb => cb(...args)));
};

describe('setUpConferenceActions', () => {
  describe('beforeAcceptTask listener', () => {
    test('sets conferenceOptions when feature flag is enabled and conferenceOptions is defined', async () => {
      mockGetAseloFeatureFlags.mockReturnValue({ enable_conference_status_event_handler: true } as any);
      setUpConferenceActions();

      const conferenceOptions: Record<string, any> = {};
      await triggerListener('beforeAcceptTask', { conferenceOptions });

      expect(conferenceOptions.conferenceStatusCallback).toBe(
        'https://lambda.example.com/conference/conferenceStatusCallback',
      );
      expect(conferenceOptions.conferenceStatusCallbackMethod).toBe('POST');
      expect(conferenceOptions.conferenceStatusCallbackEvent).toBe('leave');
    });

    test('does not throw and does nothing when feature flag is enabled but conferenceOptions is undefined (non-call task)', async () => {
      mockGetAseloFeatureFlags.mockReturnValue({ enable_conference_status_event_handler: true } as any);
      setUpConferenceActions();

      await expect(triggerListener('beforeAcceptTask', { conferenceOptions: undefined })).resolves.not.toThrow();
    });

    test('does not set conferenceOptions when feature flag is disabled', async () => {
      mockGetAseloFeatureFlags.mockReturnValue({ enable_conference_status_event_handler: false } as any);
      setUpConferenceActions();

      const conferenceOptions: Record<string, any> = {};
      await triggerListener('beforeAcceptTask', { conferenceOptions });

      expect(conferenceOptions.conferenceStatusCallback).toBeUndefined();
      expect(conferenceOptions.conferenceStatusCallbackMethod).toBeUndefined();
      expect(conferenceOptions.conferenceStatusCallbackEvent).toBeUndefined();
    });

    test('does not throw when feature flag is disabled and conferenceOptions is undefined', async () => {
      mockGetAseloFeatureFlags.mockReturnValue({ enable_conference_status_event_handler: false } as any);
      setUpConferenceActions();

      await expect(triggerListener('beforeAcceptTask', { conferenceOptions: undefined })).resolves.not.toThrow();
    });
  });

  describe('beforeHangupCall listener', () => {
    const abortFunction = jest.fn();

    beforeEach(() => {
      mockGetAseloFeatureFlags.mockReturnValue({ enable_conference_status_event_handler: true } as any);
      isTransferring.mockReturnValue(false);
      hasTaskControl.mockReturnValue(false);
    });

    test('does not throw and returns early when conference is undefined', async () => {
      setUpConferenceActions();
      const task = { conference: undefined };

      await expect(triggerListener('beforeHangupCall', { task }, abortFunction)).resolves.not.toThrow();
      expect(abortFunction).not.toHaveBeenCalled();
    });

    test('calls abortFunction when transfer is in progress', async () => {
      setUpConferenceActions();
      isTransferring.mockReturnValue(true);
      const task = {
        conference: {
          participants: [],
        },
      };

      await triggerListener('beforeHangupCall', { task }, abortFunction);

      expect(abortFunction).toHaveBeenCalled();
      expect(mockShowNotificationSingle).toHaveBeenCalledWith(
        'TransfersNotifications_CantHangTransferInProgressNotification',
      );
    });

    test('calls abortFunction when some participant is on hold with more than 2 joined participants and worker has task control', async () => {
      setUpConferenceActions();
      hasTaskControl.mockReturnValue(true);
      const task = {
        conference: {
          participants: [
            { status: 'joined', onHold: false },
            { status: 'joined', onHold: false },
            { status: 'joined', onHold: true },
          ],
        },
      };

      await triggerListener('beforeHangupCall', { task }, abortFunction);

      expect(abortFunction).toHaveBeenCalled();
      expect(mockShowNotificationSingle).toHaveBeenCalledWith('ConferenceNotifications_UnholdParticipantsNotification');
    });

    test('does not call abortFunction when conference is present with no issues', async () => {
      setUpConferenceActions();
      const task = {
        conference: {
          participants: [
            { status: 'joined', onHold: false },
            { status: 'joined', onHold: false },
          ],
        },
      };

      await triggerListener('beforeHangupCall', { task }, abortFunction);

      expect(abortFunction).not.toHaveBeenCalled();
    });
  });
});
