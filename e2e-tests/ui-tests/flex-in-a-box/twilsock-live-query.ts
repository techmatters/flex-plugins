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

/**
 * Low level functions used to mock live query / sync interactions with the flex backend
 * The data set up here is used by the twilsock connections implemented in twilsock-socket.ts to service live query requests
 * See ../aselo-service-mocks/task.ts and ./twilio-worker.ts as examples
 */

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

/**
 * Set up some starting data for a live query
 * Will NOT fire updates to any existing subscriptions
 * @param path
 * @param queryString
 * @param queryResponse
 */
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

/**
 * Site a new live query to be serviced by the twilsock connection
 * @param path
 * @param queryString
 * @param querySid
 */
export const createLiveQuery = (path: string, queryString: string, querySid: QuerySid) => {
  console.log(`CREATING LIVE QUERY:`, path, queryString, querySid);
  liveQuerySidMap[querySid] = { path, queryString };
  if (getLiveQueryData(path, queryString).length === 0) {
    initialiseLiveQueryData(path, queryString, {});
  }
};

/**
 * Subscribe to live query updates coming from Flex in your tests
 * @param querySid
 * @param handler
 */
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
  handler(
    Object.entries(queryResponse).map(([key, data]) => ({ key, data, revision: Date.now() })),
  );
};

/**
 * Update the data to be returned by a given live query and inform any subscribers
 * @param path
 * @param queryString
 * @param updatedItems
 */
export const updateLiveQueryData = (
  path: string,
  queryString: string,
  updatedItems: Record<string, any>,
) => {
  liveQueryResponses[path] = liveQueryResponses[path] ?? {};
  const liveQuery = liveQueryResponses[path][queryString || 'EMPTY_QS'];
  liveQuery.queryResponse = { ...liveQuery.queryResponse, ...updatedItems };
  Object.values(liveQuery.subscriptions).forEach((handler) => {
    handler(
      Object.entries(updatedItems).map(([key, data]) => ({ key, data, revision: Date.now() })),
    );
  });
};
