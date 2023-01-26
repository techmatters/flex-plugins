export type QuerySid = `QR${string}`;

export type LiveQueryItem = {
  key: string;
  data: any;
};

const liveQueryResponses: Record<
  string,
  Record<
    string,
    {
      queryResponse: Record<string, any>;
      subscriptions: Record<`QR${string}`, (update: LiveQueryItem[]) => void>;
    }
  >
> = {};
const liveQuerySidMap: Record<string, { path: string; queryString: string }> = {};

export const initialiseLiveQueryData = (
  path: string,
  queryString: string,
  queryResponse: Record<string, any>,
) => {
  liveQueryResponses[path] = liveQueryResponses[path] ?? {};
  return (liveQueryResponses[path][queryString || 'EMPTY_QS'] = {
    queryResponse,
    subscriptions: {},
  });
};

export const getLiveQueryData = (path: string, queryString: string) =>
  Object.entries(
    ((liveQueryResponses[path] ?? {})[queryString || 'EMPTY_QS'] ?? { queryResponse: {} })
      .queryResponse,
  ).map(([key, data]) => ({ key, data }));

export const createLiveQuery = (path: string, queryString: string, querySid: QuerySid) => {
  console.log(`CREATING LIVE QUERY:`, path, queryString, querySid);
  liveQuerySidMap[querySid] = { path, queryString };
  if (getLiveQueryData(path, queryString).length === 0) {
    initialiseLiveQueryData(path, queryString, {});
  }
};

export const subscribeToLiveQueryUpdates = (
  querySid: QuerySid,
  handler: (update: LiveQueryItem[]) => void,
) => {
  console.log(`SUBSCRIPTION ATTEMPT:`, querySid);
  const { path, queryString } = liveQuerySidMap[querySid];
  console.log(`SUBSCRIPTION MAPPING:`, path, queryString, querySid);
  const { subscriptions, queryResponse } = liveQueryResponses[path][queryString || 'EMPTY_QS'];
  subscriptions[querySid] = handler;
  console.log(`SUBSCRIPTION SUBSCRIBED:`, path, queryString, querySid);
  console.log(`SUBSCRIPTION STARTING DATA:`, queryResponse);
  handler(Object.entries(queryResponse).map(([key, data]) => ({ key, data })));
};

export const updateLiveQueryData = (
  path: string,
  queryString: string,
  updatedItems: Record<string, any>,
) => {
  liveQueryResponses[path] = liveQueryResponses[path] ?? {};
  const liveQuery = liveQueryResponses[path][queryString || 'EMPTY_QS'];
  liveQuery.queryResponse = { ...liveQuery.queryResponse, ...updatedItems };
  Object.values(liveQuery.subscriptions).forEach((handler) => {
    handler(Object.entries(updatedItems).map(([key, data]) => ({ key, data })));
  });
};
/*
const a = {
  event_type: 'live_query_updated',
  correlation_id: 1674685482047,
  event_protocol_version: 3,
  event: {
    query_id: 'QR3ae450185e5ea144034fcf05c57fb150',
    items: [
      {
        key: 'WT309ed682110a85578ef83e9b974ea909',
        data: {
          queue_name: 'Survey',
          date_updated: '2023-01-25T21:53:37.852Z',
          channel_unique_name: 'survey',
          task_sid: 'WT309ed682110a85578ef83e9b974ea909',
          workspace_sid: 'WSc92e431ee05a5d0ac322f6c886c4aee2',
          date_created: '2023-01-25T21:53:37.000Z',
          attributes: {
            channelSid: 'CHf45fe303c8974a0184fc508f8476493f',
            isSurveyTask: true,
            contactTaskId: 'WT2b0f799f93e0ff5f81275ada189dbc2a',
            customers: { external_id: 'WT309ed682110a85578ef83e9b974ea909' },
            conversations: { conversation_id: 'WT2b0f799f93e0ff5f81275ada189dbc2a' },
          },
          priority: 0,
          channel_type: 'survey',
          age: 0,
          status: 'pending',
        },
        revision: 1674683617852,
      },
      {
        key: 'WT2ab808a09a8899be3ca42e9a3e3491b4',
        data: {
          queue_name: 'Survey',
          date_updated: '2023-01-25T21:58:35.859Z',
          channel_unique_name: 'survey',
          task_sid: 'WT2ab808a09a8899be3ca42e9a3e3491b4',
          workspace_sid: 'WSc92e431ee05a5d0ac322f6c886c4aee2',
          date_created: '2023-01-25T21:58:35.000Z',
          attributes: {
            channelSid: 'CH11ffad1e28c2461f99886762921ffed4',
            isSurveyTask: true,
            contactTaskId: 'WT52ecd26526942e0900e54c69ee0a6fa6',
            customers: { external_id: 'WT2ab808a09a8899be3ca42e9a3e3491b4' },
            conversations: { conversation_id: 'WT52ecd26526942e0900e54c69ee0a6fa6' },
          },
          priority: 0,
          channel_type: 'survey',
          age: 0,
          status: 'pending',
        },
        revision: 1674683915859,
      },
      {
        key: 'WT7aa9a9c4543c6cd7e621d6e6192ef071',
        data: {
          date_updated: '2023-01-25T21:59:27.543Z',
          channel_unique_name: 'chat',
          task_sid: 'WT7aa9a9c4543c6cd7e621d6e6192ef071',
          workspace_sid: 'WSc92e431ee05a5d0ac322f6c886c4aee2',
          worker_name: 'mythily@techmatters.org',
          accepted_reservation_sid: 'WR1469a483043dc0eaad37cc8a832f215c',
          date_created: '2023-01-25T21:59:24.000Z',
          priority: 0,
          worker_sid: 'WKc2cff659f36dcc9daac0663b88922a87',
          queue_name: 'Admin',
          attributes: {
            channelSid: 'CH14b9fab6ccdb48ca8d6979b12b713211',
            helpline: 'Select helpline',
            memory: {
              at: 'counselor_handoff',
              twilio: {
                chat: {
                  ChannelSid: 'CH14b9fab6ccdb48ca8d6979b12b713211',
                  AssistantName: '',
                  Attributes: {},
                  ServiceSid: 'IS43c487114db441beaad322a360117882',
                  To: 'Bot',
                  From: 'BpYP0NwGxlvE38OU7Y8MSpoksd2QHlvI',
                  MessageSid: 'IMb5247a4dccac4a619b38f361858468fe',
                },
                collected_data: {
                  collect_survey: {
                    answers: {
                      about_self: {
                        confirm_attempts: 0,
                        answer: 'Yes',
                        filled: true,
                        type: 'Twilio.YES_NO',
                        confirmed: false,
                        validate_attempts: 1,
                        attempts: 1,
                      },
                      age: {
                        confirm_attempts: 0,
                        filled: false,
                        error: { message: 'Invalid Value', value: 'U' },
                        type: 'Age',
                        confirmed: false,
                        validate_attempts: 2,
                        attempts: 2,
                      },
                    },
                    date_completed: '2023-01-25T21:59:22Z',
                    date_started: '2023-01-25T21:59:14Z',
                    status: 'validation-max-attempts',
                  },
                },
              },
              sendToAgent: true,
            },
            transferTargetType: '',
            ip: '99.253.242.93',
            name: 'Anonymous',
            channelType: 'web',
            preEngagementData: {
              contactIdentifier: 'dev@dev.dev',
              helpline: 'Select helpline',
              ip: '99.253.242.93',
              location: 'https://tl-public-chat-as-dev.s3.amazonaws.com/as-chat-development.html',
              contactType: 'email',
              friendlyName: 'Anonymous',
            },
            ignoreAgent: '',
            customers: { external_id: 'WT7aa9a9c4543c6cd7e621d6e6192ef071' },
          },
          channel_type: 'chat',
          age: 3,
          status: 'assigned',
        },
        revision: 1674683967543,
      },
    ],
    last_event_id: 1674685482534,
  },
  strictly_ordered: true,
};
*/
