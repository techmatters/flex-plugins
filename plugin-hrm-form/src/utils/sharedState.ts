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

import { issueSyncToken } from '../services/ServerlessService';
import { getAseloFeatureFlags, getTemplateStrings } from '../hrmConfig';

let sharedStateClient: SyncClient;

export const setUpSharedStateClient = async () => {
  const updateSharedStateToken = async () => {
    try {
      const syncToken = await issueSyncToken();
      await sharedStateClient.updateToken(syncToken);
    } catch (err) {
      console.error('SYNC TOKEN ERROR', err);
    }
  };

  // initializes sync client for shared state
  const initSharedStateClient = async () => {
    try {
      const syncToken = await issueSyncToken();
      sharedStateClient = new SyncClient(syncToken);
      sharedStateClient.on('tokenAboutToExpire', () => updateSharedStateToken());
    } catch (err) {
      console.error('SYNC CLIENT INIT ERROR', err);
    }
  };

  await initSharedStateClient();
};

const isSharedStateClientConnected = sharedStateClient =>
  sharedStateClient && sharedStateClient.connectionState === 'connected';

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
  if (!isSharedStateClientConnected(sharedStateClient)) {
    console.error('Error with Sync Client connection. Sync Client object is: ', sharedStateClient);
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

    const list = await sharedStateClient.list('pending-contacts');

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
  if (!isSharedStateClientConnected(sharedStateClient)) {
    console.error('Error with Sync Client connection. Sync Client object is: ', sharedStateClient);
    console.error(getTemplateStrings().SharedStateSaveContactError);
    return { status: 'failure', callStatusSyncDocument: null } as const;
  }

  const callStatusSyncDocument = await sharedStateClient.document({
    mode: 'create_new',
    data: { CallStatus: 'initiating' },
    ttl: 60 * 2, // No need to keep track of this for longer than two minutes
  });

  callStatusSyncDocument.on('updated', onUpdateCallback);
  // Trigger the callback with the initial value of the document
  onUpdateCallback({ data: callStatusSyncDocument.data });

  return { status: 'success', callStatusSyncDocument } as const;
};

export type SwitchboardState = {
  isSwitchboardingActive: boolean;
  queueSid: string | null;
  queueName: string | null;
  startTime: string | null;
  supervisorWorkerSid: string | null;
};

const SWITCHBOARD_DOCUMENT_NAME = 'switchboard-state';
const DEFAULT_SWITCHBOARD_STATE: SwitchboardState = {
  isSwitchboardingActive: false,
  queueSid: null,
  queueName: null,
  startTime: null,
  supervisorWorkerSid: null,
};

/**
 * Initialize or get the switchboard document from Twilio Sync
 * @returns Twilio Sync document
 */
const initSwitchboardSyncDocument = () => {
  try {
    return sharedStateClient.document(SWITCHBOARD_DOCUMENT_NAME);
  } catch (error) {
    return sharedStateClient.document({
      id: SWITCHBOARD_DOCUMENT_NAME,
      data: DEFAULT_SWITCHBOARD_STATE,
      ttl: 48 * 60 * 60, // 48 hours
    });
  }
};

/**
 * Update the switchboarding state in the shared document
 * @param state Partial state to update
 * @returns Updated switchboarding state
 */
export const updateSwitchboardState = async (state: Partial<SwitchboardState>): Promise<SwitchboardState> => {
  validateSyncConnection();

  try {
    const doc = await initSwitchboardSyncDocument();
    const currentData = doc.data as SwitchboardState;
    const updatedData = { ...currentData, ...state };
    await doc.update(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error updating switchboard state:', error);
    throw error;
  }
};

/**
 * Get the current switchboard state
 * @returns Current switchboarding state
 */
export const getSwitchboardState = async (): Promise<SwitchboardState> => {
  validateSyncConnection();

  try {
    const doc = await initSwitchboardSyncDocument();
    return doc.data as SwitchboardState;
  } catch (error) {
    console.error('Error getting switchboard state:', error);
    throw error;
  }
};

/**
 * Subscribe to switchboarding state changes
 * @param callback Function to call when switchboarding state changes: (state: SwitchboardState) => void
 * @returns Function to unsubscribe from updates: () => void
 */
export const subscribeSwitchboardState = async (callback: (state: SwitchboardState) => void): Promise<() => void> => {
  validateSyncConnection();

  try {
    const doc = await initSwitchboardSyncDocument();
    const handler = (event: { data: unknown }) => {
      callback(event.data as SwitchboardState);
    };
    doc.on('updated', handler);
    callback(doc.data as SwitchboardState);
    return () => doc.off('updated', handler);
  } catch (error) {
    console.error('Error subscribing to switchboard state:', error);
    throw error;
  }
};
