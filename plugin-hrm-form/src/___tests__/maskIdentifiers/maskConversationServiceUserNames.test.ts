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

import { Manager } from '@twilio/flex-ui';
import { maskConversationServiceUserNames } from '../../maskIdentifiers';
import { getInitializedCan } from '../../permissions/rules';
import { PermissionActions } from '../../permissions/actions';

jest.mock('../../permissions/rules', () => ({
  getInitializedCan: jest.fn(),
}));

const mockGetInitializedCan = getInitializedCan as jest.MockedFunction<typeof getInitializedCan>;

describe('maskConversationServiceUserNames', () => {
  let mockManager: any;
  let subscribeCallback: () => void;
  let mockParticipant1: any;
  let mockParticipant2: any;
  let mockParticipant3: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock participants
    mockParticipant1 = {
      source: {
        identity: 'current-user-identity',
        attributes: {},
        sid: 'participant-1-sid',
      },
      friendlyName: 'Current User',
    };

    mockParticipant2 = {
      source: {
        identity: 'other-agent-identity',
        attributes: {},
        sid: 'participant-2-sid',
      },
      friendlyName: 'Other Agent',
    };

    mockParticipant3 = {
      source: {
        identity: 'service-user-identity',
        attributes: {},
        sid: 'participant-3-sid',
      },
      friendlyName: 'Service User',
    };

    // Create mock manager
    mockManager = {
      user: {
        identity: 'current-user-identity',
      },
      strings: {
        MaskIdentifiers: 'MASKED',
      },
      store: {
        subscribe: jest.fn((callback: () => void) => {
          subscribeCallback = callback;
        }),
        getState: jest.fn(() => ({
          flex: {
            chat: {
              conversations: {
                'conversation-1': {
                  participants: new Map([
                    ['participant-1', mockParticipant1],
                    ['participant-2', mockParticipant2],
                    ['participant-3', mockParticipant3],
                  ]),
                },
              },
            },
            participants: {
              bySid: {},
            },
          },
        })),
      },
    };
  });

  describe('when user does not have VIEW_IDENTIFIERS permission', () => {
    beforeEach(() => {
      const mockCan = jest.fn((action: string) => {
        if (action === PermissionActions.VIEW_IDENTIFIERS) {
          return false;
        }
        return true;
      });
      mockGetInitializedCan.mockReturnValue(mockCan);
    });

    it('should identify participant as agent when identity matches manager.user.identity', () => {
      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // The participant with matching identity should NOT be masked
      expect(mockParticipant1.friendlyName).toBe('Current User');
    });

    it('should mask participants whose identity does not match manager.user.identity and are not agents', () => {
      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Participants that are not identified as agents should be masked
      expect(mockParticipant3.friendlyName).toBe('MASKED');
    });

    it('should identify participant as agent when identity matches manager.user.identity, irrespective of other checks', () => {
      // Set up scenario where participant would fail other checks but has matching identity
      mockParticipant1.source.attributes = { member_type: 'guest' };

      // Mock the flex participants store to not include this participant
      mockManager.store.getState = jest.fn(() => ({
        flex: {
          chat: {
            conversations: {
              'conversation-1': {
                participants: new Map([['participant-1', mockParticipant1]]),
              },
            },
          },
          participants: {
            bySid: {},
          },
        },
      }));

      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Even though member_type is 'guest' and participant is not in flex.participants.bySid,
      // it should still be identified as an agent because identity matches
      expect(mockParticipant1.friendlyName).toBe('Current User');
    });

    it('should identify participant as agent when member_type is not guest (webchat 2 scenario)', () => {
      mockParticipant2.source.identity = null;
      mockParticipant2.source.attributes = { member_type: 'agent' };

      mockManager.store.getState = jest.fn(() => ({
        flex: {
          chat: {
            conversations: {
              'conversation-1': {
                participants: new Map([['participant-2', mockParticipant2]]),
              },
            },
          },
          participants: {
            bySid: {},
          },
        },
      }));

      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Participant with member_type 'agent' should not be masked
      expect(mockParticipant2.friendlyName).toBe('Other Agent');
    });

    it('should mask participant when member_type is guest (webchat 2 scenario)', () => {
      mockParticipant3.source.identity = null;
      mockParticipant3.source.attributes = { member_type: 'guest' };

      mockManager.store.getState = jest.fn(() => ({
        flex: {
          chat: {
            conversations: {
              'conversation-1': {
                participants: new Map([['participant-3', mockParticipant3]]),
              },
            },
          },
          participants: {
            bySid: {},
          },
        },
      }));

      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Participant with member_type 'guest' should be masked
      expect(mockParticipant3.friendlyName).toBe('MASKED');
    });

    it('should identify participant as agent when found in flex.participants.bySid', () => {
      // Remove identity and member_type to force check of flex.participants.bySid
      mockParticipant2.source.identity = null;

      mockManager.store.getState = jest.fn(() => ({
        flex: {
          chat: {
            conversations: {
              'conversation-1': {
                participants: new Map([['participant-2', mockParticipant2]]),
              },
            },
          },
          participants: {
            bySid: {
              'flex-participant-1': {
                type: 'agent',
                mediaProperties: {
                  conversationSid: 'conversation-1',
                  sid: 'participant-2-sid',
                },
              },
            },
          },
        },
      }));

      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Participant found in flex.participants.bySid should not be masked
      expect(mockParticipant2.friendlyName).toBe('Other Agent');
    });

    it('should mask participant when not found in flex.participants.bySid', () => {
      // Remove identity and member_type to force check of flex.participants.bySid
      mockParticipant3.source.identity = null;

      mockManager.store.getState = jest.fn(() => ({
        flex: {
          chat: {
            conversations: {
              'conversation-1': {
                participants: new Map([['participant-3', mockParticipant3]]),
              },
            },
          },
          participants: {
            bySid: {},
          },
        },
      }));

      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Participant not found in flex.participants.bySid should be masked
      expect(mockParticipant3.friendlyName).toBe('MASKED');
    });

    it('should use default mask "XXXXXX" when MaskIdentifiers string is not available', () => {
      mockParticipant3.source.identity = null;
      mockManager.strings = {};

      mockManager.store.getState = jest.fn(() => ({
        flex: {
          chat: {
            conversations: {
              'conversation-1': {
                participants: new Map([['participant-3', mockParticipant3]]),
              },
            },
          },
          participants: {
            bySid: {},
          },
        },
      }));

      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // Participant should be masked with default value
      expect(mockParticipant3.friendlyName).toBe('XXXXXX');
    });
  });

  describe('when user has VIEW_IDENTIFIERS permission', () => {
    beforeEach(() => {
      const mockCan = jest.fn((action: string) => {
        if (action === PermissionActions.VIEW_IDENTIFIERS) {
          return true;
        }
        return false;
      });
      mockGetInitializedCan.mockReturnValue(mockCan);
    });

    it('should not mask any participants', () => {
      maskConversationServiceUserNames(mockManager as Manager);

      // Trigger the subscription callback
      subscribeCallback();

      // No participants should be masked when user has VIEW_IDENTIFIERS permission
      expect(mockParticipant1.friendlyName).toBe('Current User');
      expect(mockParticipant2.friendlyName).toBe('Other Agent');
      expect(mockParticipant3.friendlyName).toBe('Service User');
    });
  });
});
