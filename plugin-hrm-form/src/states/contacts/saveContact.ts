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

import { submitContactForm } from '../../services/formSubmissionHelpers';
import {
  connectToCase,
  createOfflineContact,
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
  isTwilioTask,
  OfflineContactTask,
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
  REMOVE_FROM_CASE,
  SET_SAVED_CONTACT,
  SUBMIT_AND_FINALIZE_CONTACT_FROM_OUTSIDE_TASK_CONTEXT,
  UPDATE_CONTACT_ACTION,
} from './types';
import { ContactDraftChanges } from './existingContacts';
import { newContactMetaData } from './contactState';
import { getCase, getCaseTimeline } from '../../services/CaseService';
import * as TransferHelpers from '../../transfer/transferTaskState';
import { TaskSID, WorkerSID } from '../../types/twilio';
import { CaseStateEntry } from '../case/types';
import { getOfflineContactTask } from './offlineContactTask';
import { completeTaskAssignment, getTaskAndReservations } from '../../services/twilioTaskService';
import { setConversationDurationFromMetadata } from '../../utils/conversationDuration';
import { ProtectedApiError } from '../../services/fetchProtectedApi';
import {
  loadContactIntoRedux,
  markContactAsCreatingInRedux,
  markContactAsNotCreatingInRedux,
  rollbackSavingStateInRedux,
  contactReduxUpdates,
} from './contactReduxUpdates';
import { getAseloFeatureFlags } from '../../hrmConfig';

export const createOfflineContactAsyncAction = createAsyncAction(
  CREATE_CONTACT_ACTION,
  async (contactToCreate: Contact, workerSid: WorkerSID, task: OfflineContactTask) => {
    let contact: Contact;
    const { taskSid } = task;
    contact = await createOfflineContact(contactToCreate, workerSid, task);
    if (!contact.rawJson.contactlessTask.createdOnBehalfOf) {
      const now = new Date();
      const time = format(now, 'HH:mm');
      const date = format(now, 'yyyy-MM-dd');
      contact = await updateContactInHrm(contact.id, {
        ...BLANK_CONTACT_CHANGES,
        timeOfContact: now.toISOString(),
        rawJson: {
          ...BLANK_CONTACT_CHANGES.rawJson,
          contactlessTask: {
            channel: null,
            createdOnBehalfOf: workerSid,
            date,
            time,
          },
        },
        channel: 'default',
      });
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
      metadata: newContactMetaData({ createdAt: contact?.createdAt }),
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
    { conversationDuration, ...body }: ContactDraftChanges,
    reference?: string,
  ): Promise<FulfilledUpdatedContactActionPayload> => {
    const contact = await updateContactInHrm(
      previousContact.id,
      getAseloFeatureFlags().use_twilio_lambda_for_conversation_duration ? body : { ...body, conversationDuration },
    );
    return {
      contact,
      previousContact,
      reference,
    };
  },
  (previousContact: Contact, { conversationDuration, ...body }: ContactDraftChanges) => ({
    previousContact,
    changes: body,
  }),
);

const BLANK_CONTACT_CHANGES: ContactDraftChanges = {
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
    if (!getAseloFeatureFlags().use_twilio_lambda_for_conversation_duration) {
      const contactWithConversationDuration = setConversationDurationFromMetadata(contact, metadata);
      return submitContactForm(task, contactWithConversationDuration, caseState);
    }
    return submitContactForm(task, contact, caseState);
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
  async (task: CustomITask, reference: string = task.taskSid) => {
    const contactId = isTwilioTask(task) ? task.attributes?.contactId : undefined;
    let contact: Contact;
    if (contactId) {
      contact = await getContactById(contactId);
    } else {
      contact = await getContactByTaskSid(task.taskSid);
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
  (task: CustomITask, reference: string = task.taskSid) => ({
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

export const saveContactReducer = (initialState: ContactsState) =>
  createReducer(initialState, handleAction => [
    handleAction(
      updateContactInHrmAsyncAction.pending as typeof updateContactInHrmAsyncAction,
      (state, { meta: { changes, previousContact } }): ContactsState => {
        return contactReduxUpdates(state, previousContact, changes);
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
      createOfflineContactAsyncAction.pending as typeof createOfflineContactAsyncAction,
      (state, { meta: { taskSid } }): ContactsState => markContactAsCreatingInRedux(state, taskSid),
    ),
    handleAction(
      createOfflineContactAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        return loadContactIntoRedux(state, contact, reference, newContactMetaData({ createdAt: contact?.createdAt }));
      },
    ),
    handleAction(
      createOfflineContactAsyncAction.rejected,
      (state, { meta: { taskSid } }: any): ContactsState => markContactAsNotCreatingInRedux(state, taskSid),
    ),
    handleAction(
      submitContactFormAsyncAction.pending as typeof submitContactFormAsyncAction,
      (state, { meta: { contact } }): ContactsState => {
        // Add a temporary finalizedAt to the contact to ensure the UI updates promptly
        return contactReduxUpdates(state, contact, { ...contact, finalizedAt: new Date().toISOString() });
      },
    ),
    handleAction(
      submitContactFormAsyncAction.fulfilled,
      (state, { payload }): ContactsState => {
        return loadContactIntoRedux(state, payload, undefined, newContactMetaData({ createdAt: payload?.createdAt }));
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
        return contactReduxUpdates(state, contact, contact);
      },
    ),
    handleAction(
      newSubmitAndFinalizeContactFromOutsideTaskContextAsyncAction.fulfilled,
      (state, { payload }): ContactsState => {
        return loadContactIntoRedux(state, payload, undefined, newContactMetaData({ createdAt: payload?.createdAt }));
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
        return contactReduxUpdates(state, contactId);
      },
    ),
    handleAction(
      loadContactFromHrmByIdAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact, reference, newContactMetaData({ createdAt: contact?.createdAt }));
      },
    ),
    handleAction(
      newLoadContactFromHrmForTaskAsyncAction.pending as typeof newLoadContactFromHrmForTaskAsyncAction,
      (state, { meta: { taskSid, contactId } }): ContactsState => {
        if (contactId) {
          return contactReduxUpdates(state, contactId);
        }
        return markContactAsCreatingInRedux(state, taskSid);
      },
    ),
    handleAction(
      newLoadContactFromHrmForTaskAsyncAction.fulfilled,
      (state, { payload: { contact, reference } }): ContactsState => {
        if (!contact) return state;
        return loadContactIntoRedux(state, contact, reference, newContactMetaData({ createdAt: contact?.createdAt }));
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
