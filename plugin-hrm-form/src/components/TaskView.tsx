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

/* eslint-disable react/prop-types */
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TaskHelper } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { RootState } from '../states';
import { hasTaskControl } from '../transfer/transferTaskState';
import { CustomITask, isInMyBehalfITask, isOfflineContactTask } from '../types/types';
import ProfileIdentifierBanner from './profile/IdentifierBanner';
import { Flex } from '../styles';
import { isStandaloneITask } from './case/Case';
import { getHelplineToSave } from '../services/HelplineService';
import { getAseloFeatureFlags, getHrmConfig } from '../hrmConfig';
import { rerenderAgentDesktop } from '../rerenderView';
import { ContactState, updateDraft } from '../states/contacts/existingContacts';
import {
  createContactAsyncAction,
  loadContactFromHrmByIdAsyncAction,
  loadContactFromHrmByTaskSidAsyncAction,
} from '../states/contacts/saveContact';
import { isRouteModal } from '../states/routing/types';
import { selectCurrentBaseRoute } from '../states/routing/getRoute';
import { getUnsavedContact } from '../states/contacts/getUnsavedContact';
import ContactNotLoaded from './ContactNotLoaded';
import { completeTask } from '../services/formSubmissionHelpers';
import { newContact } from '../states/contacts/contactState';
import asyncDispatch from '../states/asyncDispatch';
import { selectIsContactCreating } from '../states/contacts/selectContactSaveStatus';
import selectContactByTaskSid from '../states/contacts/selectContactByTaskSid';
import { selectCurrentDefinitionVersion } from '../states/configuration/selectDefinitions';

type Props = {
  task: CustomITask;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const TaskView: React.FC<Props> = ({ task }) => {
  const currentDefinitionVersion = useSelector((state: RootState) => selectCurrentDefinitionVersion(state));
  // Check if the entry for this task exists in each reducer
  const { savedContact, draftContact } = useSelector(
    (state: RootState) => selectContactByTaskSid(state, task?.taskSid) ?? ({} as ContactState),
  );
  const unsavedContact = getUnsavedContact(savedContact, draftContact);
  const currentRoute = useSelector((state: RootState) => selectCurrentBaseRoute(state, task?.taskSid));
  const isModalOpen = currentRoute && isRouteModal(currentRoute);
  const contactIsCreating = useSelector((state: RootState) => selectIsContactCreating(state, task?.taskSid));
  const shouldRecreateState = currentDefinitionVersion && !savedContact && !contactIsCreating;

  const { enable_backend_hrm_contact_creation: enableBackendHrmContactCreation } = getAseloFeatureFlags();

  const dispatch = useDispatch();
  const asyncDispatcher = asyncDispatch(dispatch);
  const createContact = useCallback(
    (definition: DefinitionVersion) =>
      asyncDispatcher(createContactAsyncAction(newContact(definition, task), getHrmConfig().workerSid, task)),
    [asyncDispatcher, task],
  );
  const updateHelpline = (contactId: string, helpline: string) => dispatch(updateDraft(contactId, { helpline }));
  const taskContactId = (task?.attributes as any)?.contactId;
  React.useEffect(() => {
    if (shouldRecreateState) {
      if (isOfflineContactTask(task)) {
        asyncDispatcher(loadContactFromHrmByTaskSidAsyncAction(task.taskSid, `${task.taskSid}-active`));
      } else if (enableBackendHrmContactCreation) {
        if (taskContactId) {
          loadContactFromHrmByIdAsyncAction(task.attributes.contactId, `${task.taskSid}-active`);
        }
      } else if (TaskHelper.isTaskAccepted(task) && !task.attributes.isContactlessTask) {
        createContact(currentDefinitionVersion);
      }
    }
  }, [
    createContact,
    currentDefinitionVersion,
    asyncDispatcher,
    enableBackendHrmContactCreation,
    shouldRecreateState,
    task,
    taskContactId,
  ]);

  // Force a re-render on unmount (temporary fix NoTaskView issue with Offline Contacts)
  React.useEffect(() => {
    return () => {
      if (isOfflineContactTask(task)) rerenderAgentDesktop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contactInitialized = Boolean(unsavedContact);
  const helpline = unsavedContact?.helpline;
  const contactlessTask = unsavedContact?.rawJson?.contactlessTask;

  // Set contactForm.helpline for all contacts on the first run. React to helpline changes for offline contacts only
  React.useEffect(() => {
    const setHelpline = async () => {
      if (unsavedContact && task && !isStandaloneITask(task)) {
        const helplineToSave = await getHelplineToSave(task, contactlessTask);
        if (helpline !== helplineToSave) {
          updateHelpline(unsavedContact.id, helplineToSave);
        }
      }
    };

    // Only run setHelpline if a) contactForm.helpline is not set or b) if the task is an offline contact and contactlessTask.helpline has changed
    const shouldSetHelpline =
      contactInitialized && (!isOfflineContactTask(task) || contactlessTask?.createdOnBehalfOf) && !helpline;

    if (shouldSetHelpline) {
      setHelpline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactlessTask, contactInitialized, helpline, task, updateHelpline, unsavedContact?.id]);

  if (!currentDefinitionVersion) {
    return null;
  }

  // If this task is not the active task, or if the task is not accepted yet, hide it
  const show = task && !isInMyBehalfITask(task) && (isOfflineContactTask(task) || !TaskHelper.isPending(task));

  if (!show) return null;

  if (!unsavedContact)
    return (
      <ContactNotLoaded
        onReload={async () => {
          await createContact(currentDefinitionVersion);
        }}
        onFinish={async () => {
          await completeTask(task, unsavedContact);
        }}
      />
    );
  // If state is partially loaded, don't render until everything settles
  if (shouldRecreateState || contactIsCreating) {
    return null;
  }

  const featureFlags = getAseloFeatureFlags();
  const isFormLocked = !hasTaskControl(task);

  return (
    <Flex flexDirection="column" style={{ pointerEvents: isFormLocked ? 'none' : 'auto', height: '100%' }}>
      {featureFlags.enable_previous_contacts && !isModalOpen && <ProfileIdentifierBanner task={task} />}

      {isFormLocked && <FormNotEditable />}
      <Flex
        flexDirection="column"
        style={{
          // This fixes a UI bug where the ProfileIdentifierBanner pushes the container down
          height: '100%',
          width: '100%',
          overflow: 'auto',
        }}
      >
        <HrmForm task={task} />
      </Flex>
    </Flex>
  );
};

TaskView.displayName = 'TaskView';

export default TaskView;
