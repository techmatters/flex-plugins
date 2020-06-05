import { getConfig } from '../HrmFormPlugin';

/**
 * Saves the actual form into the Sync Client
 * @param {*} form form for current contact (or undefined)
 * @param {import("@twilio/flex-ui").ITask} task
 */
export const saveFormSharedState = async (form, task) => {
  const { sharedStateClient } = getConfig();
  if (sharedStateClient === undefined || sharedStateClient.connectionState !== 'connected') {
    window.alert("Can't access Shared State, form won't be saved");
    return null;
  }

  const documentName = form ? `pending-form-${task.taskSid}` : null;

  if (documentName) {
    const document = await sharedStateClient.document(documentName);
    const val = await document.set(form, { ttl: 86400 });
    return documentName;
  }

  return null;
};

/**
 * Restores the contact form from Sync Client (if there is any)
 * @param {import("@twilio/flex-ui").ITask} task
 */
export const loadFormSharedState = async task => {
  const { sharedStateClient } = getConfig();
  if (sharedStateClient === undefined || sharedStateClient.connectionState !== 'connected') {
    window.alert("Can't access Shared State, form can't be restored");
    return null;
  }

  if (!task.attributes.transferMeta) {
    window.alert('Task not transferred');
    return null;
  }

  const documentName = task.attributes.transferMeta.formDocument;
  if (documentName) {
    const document = await sharedStateClient.document(documentName);
    return document.value;
  }

  return null;
};
