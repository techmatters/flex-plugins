import secret from '../private/secret';
import { FieldType, recreateBlankForm } from '../states/ContactFormStateFactory';
import { isNonDataCallType } from '../states/ValidationRules';
import { channelTypes } from '../states/DomainConstants';
import { getConversationDuration, fillEndMillis } from '../utils/conversationDuration';
import { getConfig } from '../HrmFormPlugin';

export async function searchContacts(searchParams) {
  const { hrmBaseUrl } = getConfig();

  try {
    const response = await fetch(`${hrmBaseUrl}/contacts/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw response.error();
    }

    return await response.json();
  } catch (e) {
    console.log('Error searching contacts: ', e);
    return { count: 0, contacts: [] };
  }
}

export function getNumberFromTask(task) {
  let number;

  if (task.channelType === channelTypes.facebook) {
    number = task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    number = task.defaultFrom.replace('whatsapp:', '');
  } else {
    number = task.defaultFrom;
  }

  return number;
}

// VisibleForTesting
export function transformForm(form) {
  const newForm = {};
  const filterableFields = ['type', 'validation', 'error', 'touched', 'metadata'];
  Object.keys(form)
    .filter(key => !filterableFields.includes(key))
    .forEach(key => {
      switch (form[key].type) {
        case FieldType.CALL_TYPE:
        case FieldType.CHECKBOX:
        case FieldType.SELECT_SINGLE:
        case FieldType.TEXT_BOX:
        case FieldType.TEXT_INPUT:
          newForm[key] = form[key].value;
          break;
        case FieldType.CHECKBOX_FIELD:
        case FieldType.INTERMEDIATE:
        case FieldType.TAB:
          newForm[key] = {
            ...transformForm(form[key]),
          };
          break;
        default:
          throw new Error(`Unknown FieldType ${form[key].type} for key ${key} in ${JSON.stringify(form)}`);
      }
    });
  return newForm;
}

/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 *
 * @param  task
 * @param form
 * @param hrmBaseUrl
 * @param workerSid
 * @param helpline
 * @param shouldFillEndMillis
 */
export async function saveToHrm(task, form, hrmBaseUrl, workerSid, helpline, shouldFillEndMillis = true) {
  // if we got this far, we assume the form is valid and ready to submit
  const metadata = shouldFillEndMillis ? fillEndMillis(form.metadata) : form.metadata;
  const conversationDuration = getConversationDuration(metadata);
  const callType = form.callType.value;

  let rawForm = form;

  if (isNonDataCallType(callType)) {
    rawForm = {
      ...recreateBlankForm(),
      callType: form.callType,
      metadata: form.metadata,
    };
  }

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(rawForm);

  const body = {
    form: formToSend,
    twilioWorkerId: workerSid,
    queueName: task.queueName,
    channel: task.channelType,
    number: getNumberFromTask(task),
    helpline,
    conversationDuration,
  };
  console.log(`Using base url: ${hrmBaseUrl}`);

  // print the form values to the console
  console.log(`Sending: ${JSON.stringify(body)}`);
  const response = await fetch(`${hrmBaseUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = response.error();
    console.log(JSON.stringify(error));
    throw error;
  }

  return response.json();
}

export async function connectToCase(hrmBaseUrl, contactId, caseId) {
  const body = { caseId };
  const response = await fetch(`${hrmBaseUrl}/contacts/${contactId}/connectToCase`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = response.error();
    console.log(JSON.stringify(error));
    throw error;
  }

  return response.json();
}
