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
  let storeSubscribeCallback: () => void;
  let mockCan: jest.Mock;

  beforeEach(() => {
    mockCan = jest.fn();
    mockGetInitializedCan.mockReturnValue(mockCan);

    // Create a mock manager with store structure
    mockManager = {
      strings: {
        MaskIdentifiers: 'MASKED',
      },
      store: {
        subscribe: jest.fn((callback: () => void) => {
          storeSubscribeCallback = callback;
        }),
        getState: jest.fn(),
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createParticipant = (sid: string, attributes: Record<string, any> = {}) => ({
    source: {
      sid,
      attributes,
    },
    friendlyName: 'Original Name',
  });

  const createFlexParticipant = (
    type: string,
    conversationSid: string,
    participantSid: string,
  ) => ({
    type,
    mediaProperties: {
      conversationSid,
      sid: participantSid,
    },
  });

  describe('when VIEW_IDENTIFIERS permission is denied', () => {
    beforeEach(() => {
      mockCan.mockImplementation((action: string) => action !== PermissionActions.VIEW_IDENTIFIERS);
    });

    test('participant should be masked when no member_type attribute and not in flex store as agent', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid);

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('agent', conversationSid, 'MB999'), // Different participant
            },
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('MASKED');
    });

    test('participant should be masked when no member_type attribute and no agents in flex store', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid);

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('MASKED');
    });

    test('participant should be masked when no member_type attribute and only non-agent participants in flex store', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid);

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('customer', conversationSid, participantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('MASKED');
    });

    test('participant should be masked when member_type is guest, even if in flex store as agent', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid, { member_type: 'guest' });

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('agent', conversationSid, participantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('MASKED');
    });

    test('participant should NOT be masked when member_type is non-guest value, even if not in flex store as agent', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid, { member_type: 'agent' });

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('customer', conversationSid, participantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('Original Name');
    });

    test('participant should NOT be masked when member_type is supervisor', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid, { member_type: 'supervisor' });

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('Original Name');
    });

    test('participant should NOT be masked when no member_type attribute and is in flex store as agent', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid);

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('agent', conversationSid, participantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('Original Name');
    });

    test('should handle multiple conversations with different participants', () => {
      const conversationSid1 = 'CH123';
      const conversationSid2 = 'CH456';
      const agentParticipantSid = 'MB111';
      const guestParticipantSid1 = 'MB222';
      const guestParticipantSid2 = 'MB333';

      const agentParticipant = createParticipant(agentParticipantSid);
      const guestParticipant1 = createParticipant(guestParticipantSid1);
      const guestParticipant2 = createParticipant(guestParticipantSid2, { member_type: 'guest' });

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              agent1: createFlexParticipant('agent', conversationSid1, agentParticipantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid1]: {
                participants: new Map([
                  [agentParticipantSid, agentParticipant],
                  [guestParticipantSid1, guestParticipant1],
                ]),
              },
              [conversationSid2]: {
                participants: new Map([[guestParticipantSid2, guestParticipant2]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(agentParticipant.friendlyName).toBe('Original Name');
      expect(guestParticipant1.friendlyName).toBe('MASKED');
      expect(guestParticipant2.friendlyName).toBe('MASKED');
    });

    test('should use custom mask string when provided', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid);

      mockManager.strings.MaskIdentifiers = 'CUSTOM_MASK';

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('CUSTOM_MASK');
    });

    test('should use default mask string when MaskIdentifiers string is not provided', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid);

      delete mockManager.strings.MaskIdentifiers;

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('XXXXXX');
    });
  });

  describe('when VIEW_IDENTIFIERS permission is granted', () => {
    beforeEach(() => {
      mockCan.mockReturnValue(true);
    });

    test('participant should NOT be masked regardless of member_type or flex store status', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const participant = createParticipant(participantSid, { member_type: 'guest' });

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('Original Name');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockCan.mockImplementation((action: string) => action !== PermissionActions.VIEW_IDENTIFIERS);
    });

    test('should handle empty conversations object', () => {
      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {},
          },
        },
      });

      expect(() => {
        maskConversationServiceUserNames(mockManager as Manager);
        storeSubscribeCallback();
      }).not.toThrow();
    });

    test('should handle conversation with empty participants map', () => {
      const conversationSid = 'CH123';

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {},
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map(),
              },
            },
          },
        },
      });

      expect(() => {
        maskConversationServiceUserNames(mockManager as Manager);
        storeSubscribeCallback();
      }).not.toThrow();
    });

    test('should correctly identify agent when multiple participants exist in different conversations', () => {
      const conversationSid1 = 'CH123';
      const conversationSid2 = 'CH456';
      const participantSid = 'MB789';
      const participant = createParticipant(participantSid);

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('agent', conversationSid1, participantSid),
              participant2: createFlexParticipant('customer', conversationSid2, participantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid1]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      // Should not be masked because participant is an agent in conversationSid1
      expect(participant.friendlyName).toBe('Original Name');
    });

    test('should mask participant when conversationSid matches but participant sid does not', () => {
      const conversationSid = 'CH123';
      const participantSid = 'MB456';
      const differentParticipantSid = 'MB789';
      const participant = createParticipant(participantSid);

      mockManager.store.getState.mockReturnValue({
        flex: {
          participants: {
            bySid: {
              participant1: createFlexParticipant('agent', conversationSid, differentParticipantSid),
            },
          },
          chat: {
            conversations: {
              [conversationSid]: {
                participants: new Map([[participantSid, participant]]),
              },
            },
          },
        },
      });

      maskConversationServiceUserNames(mockManager as Manager);
      storeSubscribeCallback();

      expect(participant.friendlyName).toBe('MASKED');
    });
  });
});
