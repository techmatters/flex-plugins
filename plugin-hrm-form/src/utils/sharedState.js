import { getConfig } from '../HrmFormPlugin';
import { saveContactToExternalBackend } from '../dualWrite';

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
