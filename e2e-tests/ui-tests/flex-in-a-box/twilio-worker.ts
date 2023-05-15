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
 * Used to fake the behasviour of a Twilio Worker in Flex
 */

import context from './global-context';
import { subHours } from 'date-fns';
import { initialiseLiveQueryData } from './twilsock-live-query';

const hourAgo = subHours(new Date(), 1);

export const loggedInWorker = () => {
  return {
    worker_sid: context.LOGGED_IN_WORKER_SID,
    worker_activity_sid: 'WA_OFFLINE',
    activity_name: 'Offline',
    date_activity_changed: hourAgo.toISOString(),
    friendly_name: 'loggedin@worker.org',
    date_updated: hourAgo.toISOString(),
    workspace_sid: context.WORKSPACE_SID,
    attributes: {
      counselorLanguage: '',
      routing: { skills: ['chat'], levels: {} },
      helpline: '',
      full_name: 'Fake Logged In Worker',
      image_url: '',
      roles: ['admin', 'wfo.full_access'],
      contact_uri: 'client:loggedin_40worker_2Eorg',
      waitingOfflineContact: false,
      maxMessageCapacity: '3',
      email: 'loggedin@worker.org',
      twilio_contact_identity: 'loggedin_40worker_2Eorg',
    },
  };
};

/**
 * Sets up a live query in Twilsock to return a logged in worker for the worker sid used in the global context
 */
export const setLoggedInWorkerLiveQuery = () =>
  initialiseLiveQueryData(
    '/v3/Insights/tr-worker/Items',
    `data.worker_sid == "${context.LOGGED_IN_WORKER_SID}"`,
    { [context.LOGGED_IN_WORKER_SID]: loggedInWorker() },
  );
