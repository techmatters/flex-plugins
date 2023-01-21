// eslint-disable-next-line import/no-extraneous-dependencies
import { Page } from '@playwright/test';
import context from '../global-context';

type WsChannelsRequest = {
  url: string;
  method: 'GET';
  params: Record<string, string | number | boolean>;
  token: string;
};

const hourAgo = Date.now() - 60000;

const workerResponse = () => ({
  event_type: null,
  payload: {
    account_sid: context.ACCOUNT_SID,
    workspace_sid: context.WORKSPACE_SID,
    sid: context.LOGGED_IN_WORKER_SID,
    date_created: hourAgo,
    date_updated: hourAgo,
    attributes:
      '{"helpline":"","full_name":"Steve Hand","image_url":"","roles":["admin","wfo.full_access"],"contact_uri":"client:steveh_40techmatters_2Eorg","waitingOfflineContact":false,"maxMessageCapacity":"3","email":"steveh@techmatters.org","counselorLanguage":"","routing":{"skills":["chat"],"levels":{}},"twilio_contact_identity":"steveh_40techmatters_2Eorg"}',
    friendly_name: 'steveh@techmatters.org',
    available: false,
    activity_sid: 'WA_OFFLINE',
    activity_name: 'Offline',
    date_status_changed: hourAgo,
    version: 1038,
    operating_unit_sid: 'OUxxx',
  },
});

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
