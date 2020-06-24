import { getConfig } from '../HrmFormPlugin';

/**
 * Saves the actual form into the Sync Client
 * @param {*} form form for current contact (or undefined)
 * @param {import("@twilio/flex-ui").ITask} task
 */
export const saveFormSharedState = async (form, task) => {
  const { featureFlags, sharedStateClient, strings } = getConfig();

  if (!featureFlags.enable_transfers) return null;

  try {
    if (sharedStateClient === undefined || sharedStateClient.connectionState !== 'connected') {
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
    if (sharedStateClient === undefined || sharedStateClient.connectionState !== 'connected') {
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
