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

import type { ITask } from '@twilio/flex-ui';
import SyncClient from 'twilio-sync';
import { CallTypes } from 'hrm-form-definitions';

import { recordBackendError } from '../fullStory';
import { issueSyncToken } from '../services/ServerlessService';
import { getAseloFeatureFlags, getDefinitionVersions, getTemplateStrings } from '../hrmConfig';
import { CSAMReportEntry, HrmServiceContact } from '../types/types';
import { ContactMetadata, HrmServiceContactWithMetadata } from '../states/contacts/types';
import { createContactWithMetadata } from '../states/contacts/reducer';
import { ChannelTypes } from '../states/DomainConstants';
import { ResourceReferral } from '../states/contacts/resourceReferral';

// Legacy type previously used for unsaved contact forms, kept around to ensure transfers are compatible between new & old clients
// Not much point in replacing the use of this type in the shared state, since we will drop use of shared state in favour of the HRM DB for managing transfer state soon anyway
type TaskEntry = {
  helpline: string;
  callType: CallTypes;
  childInformation: { [key: string]: string | boolean };
  callerInformation: { [key: string]: string | boolean };
  caseInformation: { [key: string]: string | boolean };
  contactlessTask: {
    channel: ChannelTypes;
    date?: string;
    time?: string;
    createdOnBehalfOf?: string;
    [key: string]: string | boolean;
  };
  categories: string[];
  referrals?: ResourceReferral[];
  csamReports: CSAMReportEntry[];
  metadata: ContactMetadata;
  reservationSid?: string;
};
type TransferForm = TaskEntry & { draft: ContactMetadata['draft'] };

let sharedStateClient: SyncClient;

const transferFormCategoriesToContactCategories = (
  transferFormCategories: TaskEntry['categories'],
): HrmServiceContact['rawJson']['categories'] => {
  if (!transferFormCategories) return undefined;
  const contactCategories = {};
  transferFormCategories.forEach(transferFormCategories => {
    const [, category, subCategory] = transferFormCategories.split('.');
    contactCategories[category] = [...(contactCategories[category] ?? []), subCategory];
  });
  return contactCategories;
};

const transferFormToContact = (transferForm: TransferForm): HrmServiceContactWithMetadata => {
  const { metadata, helpline, csamReports, referrals, reservationSid, ...form } = transferForm;
  return {
    contact: {
      ...createContactWithMetadata(getDefinitionVersions().currentDefinitionVersion)(true).contact,
      helpline,
      csamReports,
      referrals,
      rawJson: {
        ...form,
        contactlessTask: form.contactlessTask as HrmServiceContact['rawJson']['contactlessTask'],
        categories: transferFormCategoriesToContactCategories(form.categories),
      },
      conversationMedia: [],
    },
    metadata: {
      ...metadata,
      draft: form.draft,
    },
  };
};

const contactFormCategoriesToTransferFormCategories = (
  contactCategories: HrmServiceContact['rawJson']['categories'],
): TaskEntry['categories'] => {
  if (!contactCategories) return undefined;
  return Object.entries(contactCategories).flatMap(([category, subCategories]) =>
    subCategories.map(subCategory => `categories.${category}.${subCategory}`),
  );
};

const contactToTransferForm = ({ contact, metadata }: HrmServiceContactWithMetadata): TransferForm => {
  const { helpline, csamReports, referrals, rawJson } = contact;
  const { draft } = metadata;
  return {
    helpline,
    csamReports,
    referrals,
    ...rawJson,
    categories: contactFormCategoriesToTransferFormCategories(rawJson?.categories),
    draft,
    metadata,
  };
};

export const setUpSharedStateClient = () => {
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

  initSharedStateClient();
};

const isSharedStateClientConnected = sharedStateClient =>
  sharedStateClient && sharedStateClient.connectionState === 'connected';

const DOCUMENT_TTL_SECONDS = 24 * 60 * 60; // 24 hours

/**
 * Saves the actual form into the Sync Client
 * @param {*} contactWithMetaData current contact (or undefined)
 * @param task
 */
export const saveFormSharedState = async (
  contactWithMetaData: HrmServiceContactWithMetadata,
  task: ITask,
): Promise<string | null> => {
  if (!getAseloFeatureFlags().enable_transfers) return null;

  try {
    if (!isSharedStateClientConnected(sharedStateClient)) {
      console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
      recordBackendError('Save Form Shared State', new Error('Sync Client Disconnected'));
      window.alert(getTemplateStrings().SharedStateSaveFormError);
      return null;
    }

    const documentName = contactWithMetaData ? `pending-form-${task.taskSid}` : null;

    if (documentName) {
      const document = await sharedStateClient.document(documentName);
      await document.set(contactToTransferForm(contactWithMetaData), { ttl: DOCUMENT_TTL_SECONDS }); // set time to live to 24 hours
      return documentName;
    }

    return null;
  } catch (err) {
    console.error('Error while saving form to shared state', err);
    return null;
  }
};

/**
 * Restores the contact form from Sync Client (if there is any)
 */
export const loadFormSharedState = async (task: ITask): Promise<HrmServiceContactWithMetadata> => {
  if (!getAseloFeatureFlags().enable_transfers) return null;

  try {
    if (!isSharedStateClientConnected(sharedStateClient)) {
      console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
      recordBackendError('Load Form Shared State', new Error('Sync Client Disconnected'));
      window.alert(getTemplateStrings().SharedStateLoadFormError);
      return null;
    }

    if (!task.attributes.transferMeta) {
      console.error('This function should not be called on non-transferred task.');
      return null;
    }

    const documentName = task.attributes.transferMeta.formDocument;
    if (documentName) {
      const document = await sharedStateClient.document(documentName);
      return transferFormToContact(document.data as TransferForm);
    }

    return null;
  } catch (err) {
    console.error('Error while loading form from shared state', err);
    throw err;
  }
};

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
    if (!isSharedStateClientConnected(sharedStateClient)) {
      console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
      console.error(getTemplateStrings().SharedStateSaveContactError);
      return null;
    }

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
    console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
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
