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

import { Message, Conversation } from '@twilio/conversations';
import { applyMiddleware, combineReducers, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { FormInputType } from 'hrm-form-definitions';

import { MockedPaginator } from '../../../test-utils';
import {
  addNotification,
  attachFiles,
  changeEngagementPhase,
  changeExpandedStatus,
  detachFiles,
  getMoreMessages,
  initPhaseThunk,
  newChangeLocaleAction,
  removeNotification,
  setOperatingHoursMessage,
  submitAndInitChatThunk,
  updatePreEngagementData,
  updatePreEngagementDataFields,
} from '../genericActions';
import { EngagementPhase, Notification } from '../../definitions';
import {
  ACTION_ADD_MULTIPLE_MESSAGES,
  ACTION_ADD_NOTIFICATION,
  ACTION_ATTACH_FILES,
  ACTION_CHANGE_LOCALE,
  ACTION_DETACH_FILES,
  ACTION_REMOVE_NOTIFICATION,
} from '../actionTypes';
import { SessionReducer } from '../../session.reducer';
import * as initActionsModule from '../initActions';
import { sessionDataHandler } from '../../../sessionDataHandler';
import { notifications } from '../../../notifications';
import * as ipTracker from '../../../ipTracker';
import * as operatingHoursService from '../../../services/operatingHoursService';

jest.mock('@twilio/conversations');

jest.mock('../../../sessionDataHandler', () => ({
  sessionDataHandler: {
    fetchAndStoreNewSession: jest.fn(),
    getRegion: jest.fn(),
  },
  getAccountScopedBaseUrl: (aseloBackendUrl: string, helplineCode: string) =>
    `${aseloBackendUrl}/lambda/twilio/account-scoped/${helplineCode.toUpperCase()}`,
}));

jest.mock('../initActions', () => ({
  initSession: jest.fn(),
  initConfigThunk: jest.fn(),
}));

const createSessionStore = () =>
  createStore(
    combineReducers({
      session: SessionReducer,
    }),
    compose(applyMiddleware(thunk)),
  );

describe('Actions', () => {
  const messages = [{ sid: 'sid1' }, { sid: 'sid2' }] as Message[];
  const users = [{ idenity: 'id' }];
  const participants = [{ getUser: () => users[0] }];
  const conversation = {
    state: { current: 'active' },
    getParticipants: () => participants,
    getMessages: () => new MockedPaginator(messages),
  } as unknown as Conversation;
  const notification: Notification = {
    message: 'Test notification',
    id: 'TestNotification',
    type: 'neutral',
    dismissible: false,
  };
  let mockStore: any;

  beforeEach(() => {
    mockStore = createSessionStore();
  });

  describe('getMoreMessages', () => {
    it('returns add multiple messages action', () => {
      mockStore.dispatch(getMoreMessages({ anchor: 0, conversation })).then((resolved: object) => {
        expect(resolved).toEqual({
          type: ACTION_ADD_MULTIPLE_MESSAGES,
          payload: {
            messages,
          },
        });
      });
    });
  });

  describe('changeExpandedStatus', () => {
    it('dispatches change change expanded status action', async () => {
      expect(mockStore.getState().session.expanded).toEqual(false);
      mockStore.dispatch(changeExpandedStatus({ expanded: true }));
      expect(mockStore.getState().session.expanded).toEqual(true);
    });
  });

  describe('changeEngagementPhase', () => {
    it('dispatches change engagement phase action', () => {
      expect(mockStore.getState().session.currentPhase).toEqual(EngagementPhase.Loading);
      mockStore.dispatch(changeEngagementPhase({ phase: EngagementPhase.MessagingCanvas }));
      expect(mockStore.getState().session.currentPhase).toEqual(EngagementPhase.MessagingCanvas);
    });
  });

  describe('attachFiles', () => {
    it('returns attach files action', () => {
      const files = [{ name: 'filename.jpg', type: 'image/jpeg', size: 1, lastModified: 1 }] as File[];

      expect(attachFiles(files)).toEqual({
        type: ACTION_ATTACH_FILES,
        payload: {
          filesToAttach: files,
        },
      });
    });
  });

  describe('detachFiles', () => {
    it('returns detach files action', () => {
      const files = [{ name: 'filename.jpg', type: 'image/jpeg', size: 1, lastModified: 1 }] as File[];

      expect(detachFiles(files)).toEqual({
        type: ACTION_DETACH_FILES,
        payload: {
          filesToDetach: files,
        },
      });
    });
  });

  describe('addNotification', () => {
    it('returns add notification action', () => {
      expect(addNotification(notification)).toEqual({
        type: ACTION_ADD_NOTIFICATION,
        payload: {
          notification,
        },
      });
    });
  });

  describe('removeNotification', () => {
    it('returns remove notification action', () => {
      expect(removeNotification(notification.id)).toEqual({
        type: ACTION_REMOVE_NOTIFICATION,
        payload: {
          id: notification.id,
        },
      });
    });
  });
});

describe('updatePreEngagementDataFields', () => {
  const formFields = [
    { name: 'firstName', type: FormInputType.Input, label: 'First name' },
    { name: 'email', type: FormInputType.Email, label: 'Email' },
  ];

  const emptyPreEngagementData = {};
  const getState = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    getState.mockReturnValue({
      config: { preEngagementFormDefinition: { fields: formFields } },
      session: { preEngagementData: emptyPreEngagementData },
    });
  });

  it('dispatches a single ACTION_UPDATE_PRE_ENGAGEMENT_DATA action with all fields updated', () => {
    const dispatch = jest.fn();
    const fieldsToUpdate = [
      { name: 'firstName', value: 'Alice' },
      { name: 'email', value: 'alice@example.com' },
    ];
    updatePreEngagementDataFields(fieldsToUpdate)(dispatch as any, getState as any, undefined);

    expect(dispatch).toHaveBeenCalledTimes(1);
    const dispatched = dispatch.mock.calls[0][0];
    expect(dispatched.type).toBe('ACTION_UPDATE_PRE_ENGAGEMENT_DATA');
    expect(dispatched.payload.firstName.value).toBe('Alice');
    expect(dispatched.payload.email.value).toBe('alice@example.com');
  });

  it('merges updated fields with existing pre-engagement data', () => {
    getState.mockReturnValue({
      config: { preEngagementFormDefinition: { fields: formFields } },
      session: { preEngagementData: { firstName: { value: 'Old', error: null, dirty: true } } },
    });
    const dispatch = jest.fn();
    updatePreEngagementDataFields([{ name: 'email', value: 'new@example.com' }])(
      dispatch as any,
      getState as any,
      undefined,
    );

    expect(dispatch).toHaveBeenCalledTimes(1);
    const dispatched = dispatch.mock.calls[0][0];
    expect(dispatched.payload.firstName.value).toBe('Old');
    expect(dispatched.payload.email.value).toBe('new@example.com');
  });
});

describe('submitAndInitChatThunk', () => {
  const token = 'token';
  const conversationSid = 'sid';

  const formFields = [{ name: 'friendlyName', type: FormInputType.Input, label: 'Name' }];
  const preEngagementData = { friendlyName: { value: 'John', error: null, dirty: true } };
  const getState = jest.fn(() => ({
    config: { preEngagementFormDefinition: { fields: formFields } },
    session: { preEngagementData },
  }));

  beforeEach(() => {
    jest.resetAllMocks();
    getState.mockReturnValue({
      config: { preEngagementFormDefinition: { fields: formFields } },
      session: { preEngagementData },
    });
  });

  it('should dispatch actions and initialize session on successful submission', async () => {
    const mockInitSessionResult = { type: 'MOCK_INIT_SESSION' } as any;
    (initActionsModule.initSession as jest.Mock).mockReturnValue(mockInitSessionResult);
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getState as any, undefined);

    const expectedData = { friendlyName: { value: 'John', error: null, dirty: true } };
    expect(dispatch).toHaveBeenCalledWith(updatePreEngagementData(expectedData));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.Loading }));
    expect(initActionsModule.initSession).toHaveBeenCalledWith({ token, conversationSid });
    expect(dispatch).toHaveBeenCalledWith(mockInitSessionResult);
  });

  it('should dispatch error notification and reset phase on session init failure', async () => {
    const errorMessage = 'Session init failed';
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getState as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(addNotification(notifications.failedToInitSessionNotification(errorMessage)));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
  });

  it('should include ip in form data when captureIp is enabled and ipLookupServiceApiKey is set', async () => {
    const mockIp = '192.168.1.1';
    const apiKey = 'test-api-key';
    jest.spyOn(ipTracker, 'getUserIp').mockResolvedValue(mockIp);
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithIp = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        captureIp: true,
        ipLookupServiceApiKey: apiKey,
      },
      session: { preEngagementData },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithIp as any, undefined);

    expect(ipTracker.getUserIp).toHaveBeenCalledWith(apiKey);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith({
      formData: { friendlyName: 'John', ip: mockIp, location: 'http://localhost/' },
    });
  });

  it('should not fetch ip when captureIp is false', async () => {
    jest.spyOn(ipTracker, 'getUserIp').mockResolvedValue('1.2.3.4');
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithoutIp = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        captureIp: false,
        ipLookupServiceApiKey: 'test-api-key',
      },
      session: { preEngagementData },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithoutIp as any, undefined);

    expect(ipTracker.getUserIp).not.toHaveBeenCalled();
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith({
      formData: { friendlyName: 'John', location: 'http://localhost/' },
    });
  });

  it('should call getUserIp with undefined and include fallback ip in form data when captureIp is true but ipLookupServiceApiKey is not set', async () => {
    const fallbackIp = '0.0.0.0';
    jest.spyOn(ipTracker, 'getUserIp').mockResolvedValue(fallbackIp);
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithoutApiKey = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        captureIp: true,
      },
      session: { preEngagementData },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithoutApiKey as any, undefined);

    expect(ipTracker.getUserIp).toHaveBeenCalledWith(undefined);
    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith({
      formData: { friendlyName: 'John', ip: fallbackIp, location: 'http://localhost/' },
    });
  });

  it('should include window.location.href as location when not already in preEngagementData', async () => {
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getState as any, undefined);

    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: expect.objectContaining({ location: 'http://localhost/' }),
      }),
    );
  });

  it('should preserve location field value when a "location" field exists in the form definition', async () => {
    const customLocation = 'https://example.com/some-page?ref=chatbot';
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const fieldsWithLocation = [...formFields, { name: 'location', type: FormInputType.Input, label: 'Location' }];

    const getStateWithLocation = jest.fn(() => ({
      config: { preEngagementFormDefinition: { fields: fieldsWithLocation } },
      session: {
        preEngagementData: {
          ...preEngagementData,
          location: { value: customLocation, error: null, dirty: true },
        },
      },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithLocation as any, undefined);

    expect(sessionDataHandler.fetchAndStoreNewSession).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: expect.objectContaining({ location: customLocation }),
      }),
    );
  });

  it('should dispatch ACTION_CHANGE_LOCALE when locale is in pre-engagement data and exists in translations', async () => {
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithLocale = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        translations: { 'en-US': { hello: 'Hello' }, 'fr-FR': { hello: 'Bonjour' } },
      },
      session: {
        preEngagementData: {
          ...preEngagementData,
          locale: { value: 'en-US', error: null, dirty: true },
        },
      },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithLocale as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(newChangeLocaleAction('en-US'));
  });

  it('should dispatch ACTION_CHANGE_LOCALE using language field when locale field is absent', async () => {
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithLanguage = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        translations: { 'fr-FR': { hello: 'Bonjour' } },
      },
      session: {
        preEngagementData: {
          ...preEngagementData,
          language: { value: 'fr-FR', error: null, dirty: true },
        },
      },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithLanguage as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(newChangeLocaleAction('fr-FR'));
  });

  it('should not dispatch ACTION_CHANGE_LOCALE when locale value is not a key in translations', async () => {
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithUnknownLocale = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        translations: { 'en-US': { hello: 'Hello' } },
      },
      session: {
        preEngagementData: {
          ...preEngagementData,
          locale: { value: 'zz-ZZ', error: null, dirty: true },
        },
      },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithUnknownLocale as any, undefined);

    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: ACTION_CHANGE_LOCALE }));
  });

  it('should not dispatch ACTION_CHANGE_LOCALE when locale value is not a string', async () => {
    (sessionDataHandler.fetchAndStoreNewSession as jest.Mock).mockResolvedValue({ token, conversationSid });
    (initActionsModule.initSession as jest.Mock).mockReturnValue({ type: 'MOCK_INIT_SESSION' });

    const getStateWithBooleanLocale = jest.fn(() => ({
      config: {
        preEngagementFormDefinition: { fields: formFields },
        translations: { 'en-US': { hello: 'Hello' } },
      },
      session: {
        preEngagementData: {
          ...preEngagementData,
          locale: { value: true, error: null, dirty: true },
        },
      },
    }));

    const dispatch = jest.fn();
    await submitAndInitChatThunk()(dispatch as any, getStateWithBooleanLocale as any, undefined);

    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: ACTION_CHANGE_LOCALE }));
  });
});

describe('initPhaseThunk', () => {
  const checkOpenHoursConfig = {
    checkOpenHours: true,
    aseloBackendUrl: 'http://backend',
    helplineCode: 'as',
    currentLocale: 'en-US',
    defaultLocale: 'en-US',
  };

  const makeGetState = (configOverride = {}) =>
    jest.fn(() => ({
      config: { ...checkOpenHoursConfig, ...configOverride },
      session: {},
    }));

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('dispatches PreEngagementForm phase when checkOpenHours is false', async () => {
    const getState = makeGetState({ checkOpenHours: false });
    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, getState as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches PreEngagementForm phase when checkOpenHours is true but aseloBackendUrl is missing', async () => {
    const getState = makeGetState({ aseloBackendUrl: '' });
    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, getState as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches PreEngagementForm phase when checkOpenHours is true but helplineCode is missing', async () => {
    const getState = makeGetState({ helplineCode: '' });
    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, getState as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('dispatches OperatingHours phase when status is closed', async () => {
    const getOperatingHoursSpy = jest.spyOn(operatingHoursService, 'getOperatingHours').mockResolvedValue({
      status: 'closed',
      message: 'We are closed.',
    });

    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, makeGetState() as any, undefined);

    expect(getOperatingHoursSpy).toHaveBeenCalledWith(
      'http://backend/lambda/twilio/account-scoped/AS',
      expect.anything(),
    );
    expect(dispatch).toHaveBeenCalledWith(setOperatingHoursMessage('We are closed.'));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.OperatingHours }));
    expect(dispatch).toHaveBeenCalledTimes(2);
  });

  it('dispatches OperatingHours phase when status is holiday', async () => {
    jest.spyOn(operatingHoursService, 'getOperatingHours').mockResolvedValue({
      status: 'holiday',
      message: 'We are on holiday.',
    });

    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, makeGetState() as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(setOperatingHoursMessage('We are on holiday.'));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.OperatingHours }));
  });

  it('uses fallback translation key for closed when no message in response', async () => {
    jest.spyOn(operatingHoursService, 'getOperatingHours').mockResolvedValue('closed');

    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, makeGetState() as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(setOperatingHoursMessage('OperatingHours-Closed-Message'));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.OperatingHours }));
  });

  it('uses fallback translation key for holiday when no message in response', async () => {
    jest.spyOn(operatingHoursService, 'getOperatingHours').mockResolvedValue('holiday');

    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, makeGetState() as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(setOperatingHoursMessage('OperatingHours-Holiday-Message'));
    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.OperatingHours }));
  });

  it('dispatches PreEngagementForm when status is open', async () => {
    jest.spyOn(operatingHoursService, 'getOperatingHours').mockResolvedValue({ status: 'open', message: '' });

    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, makeGetState() as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it('falls back to PreEngagementForm when operating hours check throws an error', async () => {
    jest.spyOn(operatingHoursService, 'getOperatingHours').mockRejectedValue(new Error('Network error'));

    const dispatch = jest.fn();

    await initPhaseThunk()(dispatch as any, makeGetState() as any, undefined);

    expect(dispatch).toHaveBeenCalledWith(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
