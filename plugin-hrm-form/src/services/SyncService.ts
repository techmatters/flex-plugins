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

import SyncClient from 'twilio-sync';
import { SWITCHBOARD_NOTIFY_DOCUMENT, SWITCHBOARD_STATE_DOCUMENT, SwitchboardSyncState } from 'hrm-types';

import { issueSyncToken } from './ServerlessService';
import { getAseloFeatureFlags, getTemplateStrings } from '../hrmConfig';
import { isErr, newErr, newOk } from '../types/Result';

// eslint-disable-next-line import/no-mutable-exports
let sharedSyncClient: SyncClient;

export const setUpSyncClient = async () => {
  const updateSharedStateToken = async () => {
    try {
      const syncToken = await issueSyncToken();
      await sharedSyncClient.updateToken(syncToken);
    } catch (err) {
      console.error('SYNC TOKEN ERROR', err);
    }
  };

  // initializes sync client for shared state
  const initSyncClient = async () => {
    try {
      const syncToken = await issueSyncToken();
      sharedSyncClient = new SyncClient(syncToken);
      sharedSyncClient.on('tokenAboutToExpire', () => updateSharedStateToken());
    } catch (err) {
      console.error('SYNC CLIENT INIT ERROR', err);
    }
  };

  await initSyncClient();
};

const isSyncClientConnected = (client: any) => client && client.connectionState === 'connected';

/**
 * This function creates an object with all parseable attributes from the original Twilio Task.
 *
 * The twilio task by itself cannot be passed directly to be store at the Shared State.
 * This happens because, internally, it tries to parse the object but it fails because of circular dependencies.
 *
 * @param {*} task Twilio Task
 * @returns Parseable copy of the Twilio Task
 */
const copyTask = (task: { _task: Record<string, any> }) => {
  const taskToReturn: Record<string, string | number | {}> = {};
  Object.keys(task._task).forEach(key => {
    const value = task[key];
    if (['object', 'string', 'number'].includes(typeof value)) {
      taskToReturn[key] = task[key];
    }
  });

  return taskToReturn;
};

/**
 * This function receives an Error and returns an error object with the following attributes:
 * - message: the Error.message
 * - stack: the original stack trace (that's optionally store at Error.cause)
 * @param {*} error an instance of Error
 * @returns error object to be stored at the Sync Client
 */
const copyError = error => ({
  message: error.message,
  ...(error.cause && { stack: error.cause }),
});

const validateSyncConnection = (): void => {
  if (!isSyncClientConnected(sharedSyncClient)) {
    console.error('Error with Sync Client connection. Sync Client object is: ', sharedSyncClient);
    console.error(getTemplateStrings().SharedStateSaveContactError);
    throw new Error('Sync client not connected');
  }
};

/**
 * Saves a pending contact into the Sync Client
 * @param task task used to save the contact
 * @param payload payload used to save the contact
 * @param error error returned when trying to save contact to external backend
 */
export const savePendingContactToSharedState = async (task, payload, error) => {
  if (!getAseloFeatureFlags().enable_dual_write) return null;
  if (!task || !payload) return null;

  try {
    validateSyncConnection();

    const list = await sharedSyncClient.list('pending-contacts');

    const taskToSave = copyTask(task);
    const errorToSave = copyError(error);

    const document = { task: taskToSave, payload, error: errorToSave, retries: 0 };
    await list.push(document);

    console.log('The following pending contact was saved at Shared State:');
    console.log(document);
  } catch (err) {
    console.error('Error while saving pending contact to shared state', err);
  }
  return null;
};

export const createCallStatusSyncDocument = async (onUpdateCallback: ({ data }: any) => void) => {
  if (!isSyncClientConnected(sharedSyncClient)) {
    console.error('Error with Sync Client connection. Sync Client object is: ', sharedSyncClient);
    console.error(getTemplateStrings().SharedStateSaveContactError);
    return { status: 'failure', callStatusSyncDocument: null } as const;
  }

  const callStatusSyncDocument = await sharedSyncClient.document({
    mode: 'create_new',
    data: { CallStatus: 'initiating' },
    ttl: 60 * 2, // No need to keep track of this for longer than two minutes
  });

  callStatusSyncDocument.on('updated', onUpdateCallback);
  // Trigger the callback with the initial value of the document
  onUpdateCallback({ data: callStatusSyncDocument.data });

  return { status: 'success', callStatusSyncDocument } as const;
};

/**
 * Get the current switchboard state
 * @returns Current switchboarding state
 */
export const getSwitchboardState = async () => {
  try {
    const doc = await sharedSyncClient.document({
      id: SWITCHBOARD_STATE_DOCUMENT,
      mode: 'open_existing',
    });

    return newOk({
      documentData: doc.data as SwitchboardSyncState,
    });
  } catch (error) {
    if (error.status === 404 || String(error).includes('Unique name not found')) {
      return newOk({
        documentData: null,
      });
    }

    const message = `Error getting switchboard state: ${error}`;
    return newErr({ error, message });
  }
};

const getOrCreateSwitchboardNotify = async () => {
  try {
    const doc = await sharedSyncClient.document({
      id: SWITCHBOARD_NOTIFY_DOCUMENT,
      data: { updatedAt: new Date().getTime() },
      mode: 'open_or_create',
    });

    return newOk(doc);
  } catch (error) {
    const message = `Error getting switchboard notify: ${error}`;
    return newErr({ error, message });
  }
};

export const subscribeSwitchboardNotify = async ({ onUpdate }: { onUpdate: () => void }) => {
  try {
    const docResult = await getOrCreateSwitchboardNotify();

    if (isErr(docResult)) {
      return docResult;
    }

    const doc = docResult.data;
    doc.on('updated', onUpdate);

    return newOk({
      unsubscribe: () => {
        doc.off('updated', onUpdate);
      },
      documentData: doc.data as SwitchboardSyncState,
    });
  } catch (error) {
    const message = `Error subscribing switchboard notify: ${error}`;
    return newErr({ error, message });
  }
};
