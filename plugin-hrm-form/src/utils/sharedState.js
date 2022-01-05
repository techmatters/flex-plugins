import { getConfig } from '../HrmFormPlugin';
import { saveContactToExternalBackend } from '../dualWrite';
import { recordBackendError } from '../fullStory';

const isSharedStateClientConnected = sharedStateClient =>
  sharedStateClient && sharedStateClient.connectionState === 'connected';

/**
 * Saves the actual form into the Sync Client
 * @param {*} form form for current contact (or undefined)
 * @param {import("@twilio/flex-ui").ITask} task
 */
export const saveFormSharedState = async (form, task) => {
  const { featureFlags, sharedStateClient, strings } = getConfig();

  if (!featureFlags.enable_transfers) return null;

  try {
    if (!isSharedStateClientConnected(sharedStateClient)) {
      console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
      recordBackendError('Save Form Shared State', new Error('Sync Client Disconnected'));
      window.alert(strings.SharedStateSaveFormError);
      return null;
    }

    const documentName = form ? `pending-form-${task.taskSid}` : null;

    if (documentName) {
      const newForm = { ...form, metadata: { ...form.metadata, tab: 1 } };

      const document = await sharedStateClient.document(documentName);
      await document.set(newForm, { ttl: 86400 }); // set time to live to 24 hours
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
 * @param {import("@twilio/flex-ui").ITask} task
 */
export const loadFormSharedState = async task => {
  const { featureFlags, sharedStateClient, strings } = getConfig();
  if (!featureFlags.enable_transfers) return null;

  try {
    if (!isSharedStateClientConnected(sharedStateClient)) {
      console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
      recordBackendError('Load Form Shared State', new Error('Sync Client Disconnected'));
      window.alert(strings.SharedStateLoadFormError);
      return null;
    }

    if (!task.attributes.transferMeta) {
      console.error('This function should not be called on non-transferred task.');
      return null;
    }

    const documentName = task.attributes.transferMeta.formDocument;
    if (documentName) {
      const document = await sharedStateClient.document(documentName);
      return document.value;
    }

    return null;
  } catch (err) {
    console.error('Error while loading form from shared state', err);
    return null;
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
const copyTask = task => {
  const taskToReturn = {};
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
 * @param {import("@twilio/flex-ui").ITask} task task used to save the contact
 * @param {*} payload payload used to save the contact
 * @param {*} error error returned when trying to save contact to external backend
 */
export const savePendingContactToSharedState = async (task, payload, error) => {
  const { featureFlags, sharedStateClient, strings } = getConfig();

  if (!featureFlags.enable_dual_write) return null;
  if (!task || !payload) return null;

  try {
    if (!isSharedStateClientConnected(sharedStateClient)) {
      console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
      console.error(strings.SharedStateSaveContactError);
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
  } finally {
    return null;
  }
};

/**
 * Loops through the pending contacts and try saving them to the external backend.
 * When a pending contact is successfully saved to the external backend, it's removed from the pending contacts list.
 * When a pending contact fails to be saved on the external backend, its 'retries' attribute is incremented.
 * @param {*} saveContactFn Function that saves a contact to the external backend
 */
export const autoRetrySavingPendingContacts = async saveContactFn => {
  const { sharedStateClient, strings } = getConfig();

  if (!isSharedStateClientConnected(sharedStateClient)) {
    console.error('Error with Sync Client conection. Sync Client object is: ', sharedStateClient);
    console.error(strings.SharedStateSaveContactError);
    return;
  }

  // Lock to prevent concurrency isues
  const pendingContactsLock = await sharedStateClient.document('pending-contacts-lock');
  if (pendingContactsLock.value.isLocked) return;

  await pendingContactsLock.set({ isLocked: true });

  try {
    const list = await sharedStateClient.list('pending-contacts');
    const successfulRetriesIndexes = [];
    const failedRetriesIndexes = [];

    const pendingContacts = (await list.getItems()).items;

    if (pendingContacts.length === 0) {
      await pendingContactsLock.set({ isLocked: false });
      return;
    }

    for (const listItem of pendingContacts) {
      const { index, value } = listItem; // This index is part of ListItem object (it's not the index from the array, it's more like an id)
      const { task, payload } = value;

      try {
        await saveContactFn(task, payload);
        successfulRetriesIndexes.push(index);
      } catch (e) {
        failedRetriesIndexes.push(index);
      }
    }

    const incrementRetries = pendingContact => {
      pendingContact.retries = (pendingContact.retries || 0) + 1;
      return pendingContact;
    };
    await Promise.all(failedRetriesIndexes.map(itemIndex => list.mutate(itemIndex, incrementRetries)));
    await Promise.all(successfulRetriesIndexes.map(itemIndex => list.remove(itemIndex)));

    console.log(`${successfulRetriesIndexes.length} pending contacts were saved to external backend`);
    console.log(`${failedRetriesIndexes.length} pending contacts could not be saved`);
  } catch (e) {
    console.error('Error while auto retrying to save pending contacts', e);
  } finally {
    await pendingContactsLock.set({ isLocked: false });
  }
};
