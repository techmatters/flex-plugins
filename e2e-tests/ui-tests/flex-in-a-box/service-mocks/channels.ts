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

/* eslint-disable @typescript-eslint/naming-convention */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from '../global-context';
import { loggedInWorker } from '../twilio-worker';

type WsChannelsRequest = {
  url: string;
  method: 'GET';
  params: Record<string, string | number | boolean>;
  token: string;
};

const hourAgo = Date.now() - 60000;

const workerResponse = () => {
  const { worker_sid, attributes, worker_activity_sid, date_activity_changed, ...worker } =
    loggedInWorker();
  return {
    event_type: null,
    payload: {
      ...worker,
      account_sid: context.ACCOUNT_SID,
      sid: worker_sid,
      date_created: hourAgo,
      attributes: JSON.stringify(attributes),
      available: false,
      activity_sid: worker_activity_sid,
      date_status_changed: date_activity_changed,
      version: 1038,
      operating_unit_sid: 'OUxxx',
    },
  };
};

const workerChannelsResponse = () => ({
  event_type: null,
  payload: {
    contents: [
      { channelSid: 'WC_DEFAULT', taskChannelSid: 'TC_DEFAULT', taskChannelUniqueName: 'default' },
      { channelSid: 'WC_CHAT', taskChannelSid: 'TC_CHAT', taskChannelUniqueName: 'chat' },
      { channelSid: 'WC_VOICE', taskChannelSid: 'TC_VOICE', taskChannelUniqueName: 'voice' },
    ].map(({ channelSid, taskChannelUniqueName, taskChannelSid }) => ({
      account_sid: context.ACCOUNT_SID,
      workspace_sid: context.WORKSPACE_SID,
      sid: channelSid,
      worker_sid: context.LOGGED_IN_WORKER_SID,
      task_channel_sid: taskChannelSid,
      configured_capacity: 3,
      available: 1,
      assigned_tasks: 0,
      available_capacity_percentage: 100.0,
      task_channel_unique_name: taskChannelUniqueName,
      date_created: hourAgo,
      date_updated: hourAgo,
      last_reserved_time: hourAgo,
    })),
    meta: { list_key: 'contents' },
    after_sid: null,
    before_sid: null,
  },
});

const activitiesResponse = () => ({
  event_type: null,
  payload: {
    contents: [
      {
        account_sid: context.ACCOUNT_SID,
        workspace_sid: context.WORKSPACE_SID,
        sid: 'WA_OFFLINE',
        date_created: hourAgo,
        date_updated: hourAgo,
        friendly_name: 'Offline',
        available: false,
      },
      {
        account_sid: context.ACCOUNT_SID,
        workspace_sid: context.WORKSPACE_SID,
        sid: 'WA_AVAILABLE',
        date_created: hourAgo,
        date_updated: hourAgo,
        friendly_name: 'Available',
        available: true,
      },
    ],
    meta: { list_key: 'contents' },
    after_sid: null,
    before_sid: null,
  },
});

const EMPTY_RESERVATIONS_RESPONSE = {
  event_type: null,
  payload: { contents: [], meta: { list_key: 'contents' }, after_sid: null, before_sid: null },
};

/**
 * Mocks out the channel service endpoints, can be modified to fake lists of available activities and channels for a worker
 * @param page
 */
export const channelService = (page: Page) => {
  async function mockWsChannelsEndpoint(): Promise<void> {
    await page.route(`https://event-bridge.twilio.com/v1/wschannels`, (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const wsChannelRequest: WsChannelsRequest = JSON.parse(request.postData() ?? '{}');
        switch (wsChannelRequest.url) {
          case `Workspaces/${context.WORKSPACE_SID}/Workers/${context.LOGGED_IN_WORKER_SID}`: {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(workerResponse()),
            });
            return;
          }
          case `Workspaces/${context.WORKSPACE_SID}/Workers/${context.LOGGED_IN_WORKER_SID}/Reservations`: {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(EMPTY_RESERVATIONS_RESPONSE),
            });
            return;
          }
          case `Workspaces/${context.WORKSPACE_SID}/Workers/${context.LOGGED_IN_WORKER_SID}/WorkerChannels`: {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(workerChannelsResponse()),
            });
            return;
          }
          case `Workspaces/${context.WORKSPACE_SID}/Activities`: {
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(activitiesResponse()),
            });
            return;
          }
        }
      }
    });
  }

  return { mockWsChannelsEndpoint };
};
