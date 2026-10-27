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

import twilio from 'twilio';
import { endConferenceOnParticipantLeaveHandler } from '../../../src/conference/endConferenceOnParticipantLeave';
import { ConferenceEvent } from '../../../src/conference/conferenceStatusCallback';
import { RecursivePartial } from '../RecursivePartial';
import { setConfigurationAttributes } from '../mockServiceConfiguration';
import {
  TEST_ACCOUNT_SID,
  TEST_TASK_SID,
  TEST_WORKSPACE_SID,
} from '../../testTwilioValues';
import { AseloServiceConfigurationAttributes } from '../../testTwilioTypes';

const CONFERENCE_SID = 'CFut';
const CUSTOMER_CALL_SID = 'CAcustomer';
const AGENT_CALL_SID = 'CAagent';
const EXTERNAL_CALL_SID = 'CAexternal';
const TEST_TASK_QUEUE_SID = 'WQut';

type MockParticipant = {
  callSid: string;
  label?: string;
  update: jest.Mock;
};

const newMockParticipant = (callSid: string, label?: string): MockParticipant => ({
  callSid,
  label,
  update: jest.fn().mockResolvedValue({}),
});

const newParticipantLeaveEvent = (callSid: string): ConferenceEvent =>
  ({
    StatusCallbackEvent: 'participant-leave',
    ConferenceSid: CONFERENCE_SID,
    CallSid: callSid,
    CustomerCallSid: CUSTOMER_CALL_SID,
    TaskSid: TEST_TASK_SID,
    WorkspaceSid: TEST_WORKSPACE_SID,
  }) as unknown as ConferenceEvent;

describe('endConferenceOnParticipantLeaveHandler', () => {
  let mockParticipantsList: jest.Mock;
  let mockConferenceUpdate: jest.Mock;
  let mockFetchTask: jest.Mock;
  let mockListReservations: jest.Mock;

  const newMockClient = (
    configurationAttributes: RecursivePartial<AseloServiceConfigurationAttributes> = {},
  ): twilio.Twilio => {
    const mockTwilioClient: RecursivePartial<twilio.Twilio> = {
      conferences: {
        get: (conferenceSid: string) => {
          if (conferenceSid !== CONFERENCE_SID) {
            throw new Error(`Unexpected conference SID: ${conferenceSid}`);
          }
          return {
            participants: {
              list: mockParticipantsList,
            },
            update: mockConferenceUpdate,
          };
        },
      },
      taskrouter: {
        v1: {
          workspaces: (() => {
            const taskContext = () => ({
              fetch: mockFetchTask,
              reservations: {
                list: mockListReservations,
              },
            });
            const workspaceContext = (workspaceSid: string) => {
              if (workspaceSid !== TEST_WORKSPACE_SID) {
                throw new Error(`Unexpected workspace SID: ${workspaceSid}`);
              }
              return {
                tasks: Object.assign(taskContext, { get: taskContext }),
              };
            };
            return Object.assign(workspaceContext, { get: workspaceContext });
          })() as unknown as RecursivePartial<
            twilio.Twilio['taskrouter']['v1']['workspaces']
          >,
        },
      },
    };
    return setConfigurationAttributes(mockTwilioClient as twilio.Twilio, {
      feature_flags: { use_twilio_lambda_for_conference_ending: true },
      ...configurationAttributes,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParticipantsList = jest.fn().mockResolvedValue([]);
    mockConferenceUpdate = jest.fn().mockResolvedValue({});
    mockFetchTask = jest.fn().mockResolvedValue({
      attributes: JSON.stringify({}),
      taskQueueSid: TEST_TASK_QUEUE_SID,
      taskChannelUniqueName: 'voice',
    });
    mockListReservations = jest.fn().mockResolvedValue([]);
  });

  test("feature flag not set - doesn't query participants or end the conference", async () => {
    const client = newMockClient({
      feature_flags: { use_twilio_lambda_for_conference_ending: false },
    });

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockParticipantsList).not.toHaveBeenCalled();
    expect(mockConferenceUpdate).not.toHaveBeenCalled();
  });

  test('no participants remaining - takes no action', async () => {
    const client = newMockClient();
    mockParticipantsList.mockResolvedValue([]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(CUSTOMER_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).not.toHaveBeenCalled();
  });

  test('customer leaves with only the agent remaining - ends the conference', async () => {
    const client = newMockClient();
    const agent = newMockParticipant(AGENT_CALL_SID);
    mockParticipantsList.mockResolvedValue([agent]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(CUSTOMER_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).toHaveBeenCalledWith({ status: 'completed' });
    expect(agent.update).not.toHaveBeenCalled();
  });

  test('agent leaves with only the customer remaining and no post studio flow configured - ends the conference', async () => {
    const client = newMockClient();
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).toHaveBeenCalledWith({ status: 'completed' });
  });

  test("agent leaves with only the customer remaining and an 'inProgressCall' post studio flow configured for the queue - leaves the conference running and takes the customer off hold & mute", async () => {
    const client = newMockClient({
      postStudioFlows: {
        [TEST_TASK_QUEUE_SID]: {
          studioFlowSid: 'FWut',
          flowTrigger: 'inProgressCall',
        },
      },
    });
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).not.toHaveBeenCalled();
    expect(customer.update).toHaveBeenCalledWith({ hold: false, muted: false });
  });

  test("agent leaves with only the customer remaining and an 'inProgressCall' post studio flow configured for the channel - leaves the conference running and takes the customer off hold & mute", async () => {
    const client = newMockClient({
      postStudioFlows: {
        voice: {
          studioFlowSid: 'FWut',
          flowTrigger: 'inProgressCall',
        },
      },
    });
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).not.toHaveBeenCalled();
    expect(customer.update).toHaveBeenCalledWith({ hold: false, muted: false });
  });

  test("agent leaves with only the customer remaining and a 'rest' post studio flow configured - ends the conference", async () => {
    const client = newMockClient({
      postStudioFlows: {
        [TEST_TASK_QUEUE_SID]: {
          studioFlowSid: 'FWut',
          flowTrigger: 'rest',
        },
      },
    });
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).toHaveBeenCalledWith({ status: 'completed' });
  });

  test('agent leaves with only the customer remaining during a transfer - leaves the conference and holds untouched', async () => {
    const client = newMockClient();
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer]);
    // Task is mid transfer: transferMeta set but the reservation with task control doesn't exist
    mockFetchTask.mockResolvedValue({
      attributes: JSON.stringify({
        transferMeta: {
          mode: 'COLD',
          transferStatus: 'accepted',
          sidWithTaskControl: 'WR00000000000000000000000000000000',
        },
      }),
      taskQueueSid: TEST_TASK_QUEUE_SID,
      taskChannelUniqueName: 'voice',
    });

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).not.toHaveBeenCalled();
    expect(customer.update).not.toHaveBeenCalled();
  });

  test('agent leaves with the customer and an external party remaining - keeps the conference and takes both off hold & mute', async () => {
    const client = newMockClient();
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    const external = newMockParticipant(EXTERNAL_CALL_SID, 'external party');
    mockParticipantsList.mockResolvedValue([customer, external]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).not.toHaveBeenCalled();
    expect(customer.update).toHaveBeenCalledWith({ hold: false, muted: false });
    expect(external.update).toHaveBeenCalledWith({ hold: false, muted: false });
  });

  test('external party leaves with the customer and the agent remaining - takes no action', async () => {
    const client = newMockClient();
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    const agent = newMockParticipant(AGENT_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer, agent]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(EXTERNAL_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockConferenceUpdate).not.toHaveBeenCalled();
    expect(customer.update).not.toHaveBeenCalled();
    expect(agent.update).not.toHaveBeenCalled();
  });

  test('leaving participant still included in the participant list - is not counted as remaining', async () => {
    const client = newMockClient();
    const customer = newMockParticipant(CUSTOMER_CALL_SID);
    const leavingAgent = newMockParticipant(AGENT_CALL_SID);
    mockParticipantsList.mockResolvedValue([customer, leavingAgent]);

    await endConferenceOnParticipantLeaveHandler(
      newParticipantLeaveEvent(AGENT_CALL_SID),
      TEST_ACCOUNT_SID,
      client,
    );

    // Only the customer remains, so the conference should be ended
    expect(mockConferenceUpdate).toHaveBeenCalledWith({ status: 'completed' });
  });

  test('non participant-leave event - takes no action', async () => {
    const client = newMockClient();

    await endConferenceOnParticipantLeaveHandler(
      {
        StatusCallbackEvent: 'participant-join',
        ConferenceSid: CONFERENCE_SID,
      } as unknown as ConferenceEvent,
      TEST_ACCOUNT_SID,
      client,
    );

    expect(mockParticipantsList).not.toHaveBeenCalled();
    expect(mockConferenceUpdate).not.toHaveBeenCalled();
  });
});
