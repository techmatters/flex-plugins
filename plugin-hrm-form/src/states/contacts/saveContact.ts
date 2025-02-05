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

import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';
import { format } from 'date-fns';
import { TaskHelper } from '@twilio/flex-ui';

import { submitContactForm } from '../../services/formSubmissionHelpers';
import {
  connectToCase,
  createContact,
  finalizeContact,
  getContactById,
  getContactByTaskSid,
  removeFromCase,
  saveContact,
  updateContactInHrm,
} from '../../services/ContactService';
import {
  Case,
  Contact,
  CustomITask,
  isOfflineContact,
  isOfflineContactTask,
  isTwilioTask,
  RouterTask,
} from '../../types/types';
import {
  CONNECT_TO_CASE,
  ContactMetadata,
  ContactsState,
  CREATE_CONTACT_ACTION,
  FINALIZE_CONTACT,
  LOAD_CONTACT_FROM_HRM_BY_ID_ACTION,
  LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION,
  LoadingStatus,
  REMOVE_FROM_CASE,
  SET_SAVED_CONTACT,
  SUBMIT_AND_FINALIZE_CONTACT_FROM_OUTSIDE_TASK_CONTEXT,
  UPDATE_CONTACT_ACTION,
} from './types';
import { ContactDraftChanges } from './existingContacts';
import { newContactMetaData } from './contactState';
import { getCase, getCaseTimeline } from '../../services/CaseService';
import { getUnsavedContact } from './getUnsavedContact';
import * as TransferHelpers from '../../transfer/transferTaskState';
import { TaskSID, WorkerSID } from '../../types/twilio';
import { CaseStateEntry } from '../case/types';
import { getOfflineContactTask } from './offlineContactTask';
import { completeTaskAssignment, getTaskAndReservations } from '../../services/twilioTaskService';
import { setConversationDurationFromMetadata } from '../../utils/conversationDuration';
import { ProtectedApiError } from '../../services/fetchProtectedApi';

export const createContactAsyncAction = createAsyncAction(
  CREATE_CONTACT_ACTION,
  async (contactToCreate: Contact, workerSid: WorkerSID, task: CustomITask) => {
    let contact: Contact;
    const { taskSid } = task;
    if (isOfflineContactTask(task)) {
      contact = await createContact(contactToCreate, workerSid, task);
    } else {
      const attributes = task.attributes ?? {};
      const { contactId } = attributes;
      if (contactId) {
        // Setting the task id and worker id on the contact will be a noop in most cases, but when receiving a transfer it will move the contact to the new worker & task
        contact = await updateContactInHrm(contactId, { taskId: taskSid, twilioWorkerId: workerSid }, false);
      } else {
        contact = await createContact(contactToCreate, workerSid, task);
        if (contact.taskId! !== taskSid || contact.twilioWorkerId !== workerSid) {
          // If the contact is being transferred from a client that doesn't set the contactId on the task, we need to update the contact with the task id and worker id
          contact = await updateContactInHrm(contact.id, { taskId: taskSid, twilioWorkerId: workerSid }, false);
        }
        await task.setAttributes({ ...attributes, contactId: contact.id });
      }
      if (TransferHelpers.isColdTransfer(task) && !TransferHelpers.hasTaskControl(task))
        await TransferHelpers.takeTaskControl(task);
    }

    let contactCase: Case | undefined;
    if (contact.caseId) {
      contactCase = await getCase(contact.caseId);
    }

    return {
      contact,
      contactCase,
      // We assume that any contact we create will be the active contact because that's the only way to create contacts currently
      // This assumption may not always be valid.
      reference: `${taskSid}-active`,
      metadata: newContactMetaData(false),
    };
  },
  (contactToCreate: Contact, workerSid: string, { taskSid }: CustomITask) => ({
    contactToCreate,
    workerSid,
    taskSid,
  }),
);

type FulfilledUpdatedContactActionPayload = { contact: Contact; previousContact: Contact; reference: string };

export const updateContactInHrmAsyncAction = createAsyncAction(
  UPDATE_CONTACT_ACTION,
  async (
    previousContact: Contact,
    body: ContactDraftChanges,
    reference?: string,
  ): Promise<FulfilledUpdatedContactActionPayload> => {
    const contact = await updateContactInHrm(previousContact.id, body);
    return {
      contact,
      previousContact,
      reference,
    };
  },
  (previousContact: Contact, body: ContactDraftChanges) => ({
    previousContact,
    changes: body,
  }),
);

const BLANK_CONTACT_CHANGES: ContactDraftChanges = {
  conversationDuration: 0,
  rawJson: {
    callType: '',
    childInformation: {},
    callerInformation: {},
    caseInformation: {},
    categories: {},
    contactlessTask: {
      channel: null,
      createdOnBehalfOf: null,
    },
  },
};

export const newClearContactAsyncAction = (contact: Contact) =>
  updateContactInHrmAsyncAction(contact, {
    ...BLANK_CONTACT_CHANGES,
    timeOfContact: new Date().toISOString(),
  });

export const newRestartOfflineContactAsyncAction = (contact: Contact, createdOnBehalfOf: WorkerSID) => {
  const now = new Date();
  const time = format(now, 'HH:mm');
  const date = format(now, 'yyyy-MM-dd');
  return updateContactInHrmAsyncAction(contact, {
    ...BLANK_CONTACT_CHANGES,
    timeOfContact: now.toISOString(),
    rawJson: {
      ...BLANK_CONTACT_CHANGES.rawJson,
      contactlessTask: {
        channel: null,
        createdOnBehalfOf,
        date,
        time,
      },
    },
    channel: 'default',
  });
};

type ConnectToCaseActionPayload = { contactId: string; caseId: string; contact: Contact; contactCase: Case };
type RemoveFromCaseActionPayload = { contactId: string; contact: Contact };

export const connectToCaseAsyncAction = createAsyncAction(
  CONNECT_TO_CASE,
  async (contactId: string, caseId: string | null): Promise<ConnectToCaseActionPayload> => {
    const contact = await connectToCase(contactId, caseId);
    const contactCase = await getCase(caseId);
    return { contactId, caseId, contact, contactCase };
  },
);

export const removeFromCaseAsyncAction = createAsyncAction(
  REMOVE_FROM_CASE,
  async (contactId: string): Promise<RemoveFromCaseActionPayload> => {
    const contact = await removeFromCase(contactId);
    return { contactId, contact };
  },
);

export const submitContactFormAsyncAction = createAsyncAction(
  SET_SAVED_CONTACT,
  async (task: CustomITask, contact: Contact, metadata: ContactMetadata, caseState: CaseStateEntry) => {
    const contactWithConversationDuration = setConversationDurationFromMetadata(contact, metadata);
    return submitContactForm(task, contactWithConversationDuration, caseState);
  },
  (task: CustomITask, contact: Contact, metadata: ContactMetadata, caseState: CaseStateEntry) => ({
    task,
    contact,
    metadata,
    caseState,
  }),
);

export const newFinalizeContactAsyncAction = createAsyncAction(
  FINALIZE_CONTACT,
  async (task: RouterTask, contact: Contact) => {
    return finalizeContact(task, contact);
  },
);

export const newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction = createAsyncAction(
  SUBMIT_AND_FINALIZE_CONTACT_FROM_OUTSIDE_TASK_CONTEXT,
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async (contact: Contact) => {
    const { taskId: taskSid } = contact;
    let task: CustomITask | ITask | undefined;
    let reservationSid: string | undefined;
    let caseState: Pick<CaseStateEntry, 'sections' | 'connectedCase'> | undefined = undefined;

    if (isOfflineContact(contact)) {
      task = getOfflineContactTask();
    } else {
      const taskResponse = await getTaskAndReservations(taskSid);
      if (taskResponse) {
        ({ task } = taskResponse);
        reservationSid = taskResponse?.reservations?.[0]?.sid;
      } else {
        console.warn(
          `Task and reservation not found, likely because the task is no longer stored in Twilio: ${taskSid}`,
        );
      }
    }

    if (contact.caseId) {
      const [connectedCase, timeline] = await Promise.all([
        getCase(contact.caseId),
        getCaseTimeline(contact.caseId, ['household', 'perpetrator', 'incident', 'referral'], false, {
          offset: 0,
          limit: 1,
        }),
      ]);
      const sections = Object.fromEntries(timeline.activities.map(({ activity }) => [activity.sectionType, activity]));
      caseState = { connectedCase, sections };
    }
    if (isOfflineContact(contact)) {
      try {
        // 'await' is used here to ensure that the error is thrown and caught in the try-catch block
        return await submitContactForm(task, contact, caseState);
      } catch (error) {
        if (error instanceof ProtectedApiError) {
          const tasklessSid: TaskSID = `WT-taskless-offline-contact-${contact.accountSid}-${contact.id}`;
          console.error(
            `Error creating Twilio task for offline contact, attempting to save with placeholder task SID '${tasklessSid}'`,
            error,
          );
          await saveContact(task, contact, contact.twilioWorkerId, tasklessSid);
          return finalizeContact(task, contact);
        }
        throw error;
      }
    } else if (task) {
      await completeTaskAssignment(task.taskSid || (isTwilioTask(task) && task.sid));
      const updatedContact = await submitContactForm(task, contact, caseState);
      return finalizeContact(task, updatedContact, reservationSid);
    }
    return finalizeContact(task, contact);
  },
  (contact: Contact) => contact,
);

export const newLoadContactFromHrmForTaskAsyncAction = createAsyncAction(
  LOAD_CONTACT_FROM_HRM_FOR_TASK_ACTION,
  async (task: CustomITask, workerSid: WorkerSID, reference: string = task.taskSid) => {
    const { taskSid } = task;
    const contactId = isTwilioTask(task) ? task.attributes?.contactId : undefined;
    let contact: Contact;
    if (contactId) {
      contact = await getContactById(contactId);
    } else {
      contact = await getContactByTaskSid(task.taskSid);
    }
    if (contact.taskId !== task.taskSid || contact.twilioWorkerId !== workerSid) {
      // If the contact is being transferred from a client that doesn't set the contactId on the task, we need to update the contact with the task id and worker id
      contact = await updateContactInHrm(contact.id, { taskId: taskSid, twilioWorkerId: workerSid }, false);
    }
    if (isTwilioTask(task) && TransferHelpers.isColdTransfer(task) && !TransferHelpers.hasTaskControl(task))
      await TransferHelpers.takeTaskControl(task);
    let contactCase: Case | undefined;
    if (contact?.caseId) {
      contactCase = await getCase(contact.caseId);
    }
    return {
      contact,
      contactCase,
      reference,
    };
  },
  (task: CustomITask, workerSid: WorkerSID, reference: string = task.taskSid) => ({
    taskSid: task.taskSid,
    contactId: isTwilioTask(task) && task.attributes?.contactId,
    reference,
  }),
);

export const loadContactFromHrmByIdAsyncAction = createAsyncAction(
  LOAD_CONTACT_FROM_HRM_BY_ID_ACTION,
  async (contactId: string, reference: string = contactId) => {
    const contact = await getContactById(contactId);
    return {
      contact,
      reference,
    };
  },
  (contactId: string, reference: string = contactId) => ({
    contactId,
    reference,
  }),
);

const markContactAsCreatingInRedux = (state: ContactsState, taskSid: string): ContactsState => {
  const contactsBeingCreated = new Set(state.contactsBeingCreated);
  contactsBeingCreated.add(taskSid);
  return {
    ...state,
    contactsBeingCreated,
  };
};

const markContactAsNotCreatingInRedux = (state: ContactsState, taskSid: string): ContactsState => {
  const contactsBeingCreated = new Set(state.contactsBeingCreated);
  contactsBeingCreated.delete(taskSid);
  return {
    ...state,
    contactsBeingCreated,
  };
};

// TODO: Consolidate this logic with the loadContactReducer implementation?
export const loadContactIntoRedux = (
  state: ContactsState,
  contact: Contact,
  reference?: string,
  newMetadata?: ContactMetadata,
): ContactsState => {
  const { existingContacts } = state;
  const references = existingContacts[contact.id]?.references ?? new Set();
  if (reference) {
    references.add(reference);
  }
  const metadata = { ...newContactMetaData(false), ...(newMetadata ?? existingContacts[contact.id]?.metadata) };
  const existingContact = existingContacts[contact.id]?.savedContact;
  const existingAssociations = {
    ...(existingContact?.csamReports ? { csamReports: existingContact.csamReports } : {}),
    ...(existingContact?.conversationMedia ? { conversationMedia: existingContact.conversationMedia } : {}),
    ...(existingContact?.referrals ? { referrals: existingContact.referrals } : {}),
  };
  return {
    ...markContactAsNotCreatingInRedux(state, contact.taskId),
    existingContacts: {
      ...existingContacts,
      [contact.id]: {
        ...existingContacts[contact.id],
        metadata: { ...metadata, loadingStatus: LoadingStatus.LOADED },
        savedContact: {
          ...existingAssociations,
          ...contact,
        },
        references: references ?? existingContacts[contact.id]?.references,
      },
    },
  };
};

const setContactLoadingStateInRedux = (
  state: ContactsState,
  contact: Contact | string,
  updates: ContactDraftChanges = undefined,
): ContactsState => {
  const { existingContacts } = state;
  const id = typeof contact === 'object' ? contact.id : contact;
  return {
    ...state,
    existingContacts: {
      ...state.existingContacts,
      [id]: {
        ...existingContacts[id],
        draftContact: undefined,
        savedContact: getUnsavedContact(existingContacts[id]?.savedContact, updates),
        metadata: {
          ...newContactMetaData(false),
          ...existingContacts[id]?.metadata,
          loadingStatus: LoadingStatus.LOADING,
        },
      },
    },
  };
};

const rollbackSavingStateInRedux = (
  state: ContactsState,
  contact: Contact,
  changes: ContactDraftChanges,
): ContactsState => {
  const { existingContacts } = state;
  return {
    ...state,
    existingContacts: {
      ...existingContacts,
      [contact.id]: {
        ...existingContacts[contact.id],
        draftContact: changes,
        savedContact: contact,
        metadata: { ...existingContacts[contact.id]?.metadata, loadingStatus: LoadingStatus.LOADED },
      },
    },
  };
};

export const saveContactReducer = (initialState: ContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      updateContactInHrmAsyncAction.pending as typeof updateContactInHrmAsyncAction,
      (state, { meta: { changes, previousContact } }): ContactsState => {
        return setContactLoadingStateInRedux(state, previousContact, changes);
      },
    ),

    handleAction(
      updateContactInHrmAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        return loadContactIntoRedux(state, contact, reference);
      },
    ),
    handleAction(
      updateContactInHrmAsyncAction.rejected as typeof updateContactInHrmAsyncAction.rejected,
      (state, action): ContactsState => {
        const {
          meta: { previousContact, changes },
        } = action as typeof action & {
          meta: { previousContact: Contact; changes: ContactDraftChanges };
        };
        return rollbackSavingStateInRedux(state, previousContact, changes);
      },
    ),
    handleAction(
      createContactAsyncAction.pending as typeof createContactAsyncAction,
      (state, { meta: { taskSid } }): ContactsState => markContactAsCreatingInRedux(state, taskSid),
    ),
    handleAction(
      createContactAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        return loadContactIntoRedux(state, contact, reference, newContactMetaData(false));
      },
    ),
    handleAction(
      createContactAsyncAction.rejected,
      (state, { meta: { taskSid } }: any): ContactsState => markContactAsNotCreatingInRedux(state, taskSid),
    ),
    handleAction(
      submitContactFormAsyncAction.pending as typeof submitContactFormAsyncAction,
      (state, { meta: { contact } }): ContactsState => {
        return setContactLoadingStateInRedux(state, contact, contact);
      },
    ),
    handleAction(
      submitContactFormAsyncAction.fulfilled,
      (state, { payload }): ContactsState => {
        return loadContactIntoRedux(state, payload, undefined, newContactMetaData(false));
      },
    ),
    handleAction(
      submitContactFormAsyncAction.rejected,
      (state, action): ContactsState => {
        const {
          meta: { contact },
        } = action as typeof action & {
          meta: { contact: Contact; changes: ContactDraftChanges };
        };
        return rollbackSavingStateInRedux(state, contact, undefined);
      },
    ),
    handleAction(
      newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction.pending as typeof newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction,
      (state, { meta: contact }): ContactsState => {
        return setContactLoadingStateInRedux(state, contact, contact);
      },
    ),
    handleAction(
      newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction.fulfilled,
      (state, { payload }): ContactsState => {
        return loadContactIntoRedux(state, payload, undefined, newContactMetaData(false));
      },
    ),
    handleAction(
      newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction.rejected,
      (state, action): ContactsState => {
        const { meta: contact } = action as typeof action & {
          meta: Contact;
        };
        return rollbackSavingStateInRedux(state, contact, undefined);
      },
    ),
    handleAction(
      loadContactFromHrmByIdAsyncAction.pending as typeof loadContactFromHrmByIdAsyncAction,
      (state, { meta: { contactId } }): ContactsState => {
        return setContactLoadingStateInRedux(state, contactId);
      },
    ),
    handleAction(
      loadContactFromHrmByIdAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact, reference, newContactMetaData(true));
      },
    ),
    handleAction(
      newLoadContactFromHrmForTaskAsyncAction.pending as typeof newLoadContactFromHrmForTaskAsyncAction,
      (state, { meta: { taskSid, contactId } }): ContactsState => {
        if (contactId) {
          return setContactLoadingStateInRedux(state, contactId);
        }
        return markContactAsCreatingInRedux(state, taskSid);
      },
    ),
    handleAction(
      newLoadContactFromHrmForTaskAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact, reference, newContactMetaData(true));
      },
    ),
    handleAction(
      newLoadContactFromHrmForTaskAsyncAction.rejected,
      (state, { meta: { taskSid } }: any): ContactsState => markContactAsNotCreatingInRedux(state, taskSid),
    ),
    handleAction(
      connectToCaseAsyncAction.fulfilled,
      (state, { payload: { contact } }): ContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact);
      },
    ),
    handleAction(
      removeFromCaseAsyncAction.fulfilled,
      (state, { payload: { contact } }): ContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact);
      },
    ),

    handleAction(
      newFinalizeContactAsyncAction.fulfilled,
      (state, { payload: contact }): ContactsState => {
        return loadContactIntoRedux(state, contact);
      },
    ),
  ]);
