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

import twilio from 'twilio';
import { transitionAgentParticipants } from '../../../src/conversation/interactionChannelParticipants';
import { RecursivePartial } from '../RecursivePartial';

const FLEX_INTERACTION_SID = 'KDtest';
const FLEX_INTERACTION_CHANNEL_SID = 'UOtest';

describe('transitionAgentParticipants', () => {
  let mockParticipantUpdate: jest.Mock;
  let mockParticipantsList: jest.Mock;
  let mockClient: RecursivePartial<twilio.Twilio>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockParticipantUpdate = jest.fn().mockResolvedValue({});
    mockParticipantsList = jest.fn();

    mockClient = {
      flexApi: {
        v1: {
          interaction: {
            get: () => ({
              channels: {
                get: () => ({
                  participants: {
                    list: mockParticipantsList,
                  },
                }),
              },
            }),
          },
        },
      },
    };
  });

  test('missing flexInteractionSid - logs warning and returns without updating', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await transitionAgentParticipants(
      mockClient as twilio.Twilio,
      { flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID },
      'closed',
    );

    expect(mockParticipantsList).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('transitionAgentParticipants called without'),
    );
    consoleSpy.mockRestore();
  });

  test('missing flexInteractionChannelSid - logs warning and returns without updating', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await transitionAgentParticipants(
      mockClient as twilio.Twilio,
      { flexInteractionSid: FLEX_INTERACTION_SID },
      'closed',
    );

    expect(mockParticipantsList).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('transitionAgentParticipants called without'),
    );
    consoleSpy.mockRestore();
  });

  test('updates all agent participants when no interactionChannelParticipantSid provided', async () => {
    const agent1 = { type: 'agent', sid: 'KPagent1', update: mockParticipantUpdate };
    const agent2 = { type: 'agent', sid: 'KPagent2', update: mockParticipantUpdate };
    const customer = {
      type: 'customer',
      sid: 'KPcustomer',
      update: mockParticipantUpdate,
    };
    mockParticipantsList.mockResolvedValue([agent1, agent2, customer]);

    await transitionAgentParticipants(
      mockClient as twilio.Twilio,
      {
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
      },
      'closed',
    );

    expect(mockParticipantUpdate).toHaveBeenCalledTimes(2);
    expect(mockParticipantUpdate).toHaveBeenCalledWith({ status: 'closed' });
  });

  test('updates only specified agent participant when interactionChannelParticipantSid provided', async () => {
    const agent1Update = jest.fn().mockResolvedValue({});
    const agent2Update = jest.fn().mockResolvedValue({});
    const agent1 = { type: 'agent', sid: 'KPagent1', update: agent1Update };
    const agent2 = { type: 'agent', sid: 'KPagent2', update: agent2Update };
    mockParticipantsList.mockResolvedValue([agent1, agent2]);

    await transitionAgentParticipants(
      mockClient as twilio.Twilio,
      {
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
      },
      'closed',
      'KPagent1',
    );

    expect(agent1Update).toHaveBeenCalledWith({ status: 'closed' });
    expect(agent2Update).not.toHaveBeenCalled();
  });

  test('no agent participants - does not attempt any updates', async () => {
    const customer = {
      type: 'customer',
      sid: 'KPcustomer',
      update: mockParticipantUpdate,
    };
    mockParticipantsList.mockResolvedValue([customer]);

    await transitionAgentParticipants(
      mockClient as twilio.Twilio,
      {
        flexInteractionSid: FLEX_INTERACTION_SID,
        flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
      },
      'wrapup',
    );

    expect(mockParticipantUpdate).not.toHaveBeenCalled();
  });

  test('continues with remaining participants if one update fails', async () => {
    const agent1Update = jest.fn().mockRejectedValue(new Error('Update failed'));
    const agent2Update = jest.fn().mockResolvedValue({});
    const agent1 = { type: 'agent', sid: 'KPagent1', update: agent1Update };
    const agent2 = { type: 'agent', sid: 'KPagent2', update: agent2Update };
    mockParticipantsList.mockResolvedValue([agent1, agent2]);

    // Should not throw even if one update fails
    await expect(
      transitionAgentParticipants(
        mockClient as twilio.Twilio,
        {
          flexInteractionSid: FLEX_INTERACTION_SID,
          flexInteractionChannelSid: FLEX_INTERACTION_CHANNEL_SID,
        },
        'closed',
      ),
    ).resolves.toBeUndefined();

    expect(agent1Update).toHaveBeenCalled();
    expect(agent2Update).toHaveBeenCalled();
  });
});
