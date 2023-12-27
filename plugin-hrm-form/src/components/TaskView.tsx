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
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { TaskHelper } from '@twilio/flex-ui';
import { DefinitionVersion } from 'hrm-form-definitions';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { RootState } from '../states';
import { hasTaskControl } from '../transfer/transferTaskState';
import { CustomITask, isInMyBehalfITask, isOfflineContactTask } from '../types/types';
import ProfileIdentifierBanner from './profile/ProfileIdentifierBanner';
import { Flex } from '../styles/HrmStyles';
import { isStandaloneITask } from './case/Case';
import { getHelplineToSave } from '../services/HelplineService';
import { getAseloFeatureFlags, getHrmConfig } from '../hrmConfig';
import { rerenderAgentDesktop } from '../rerenderView';
import { updateDraft } from '../states/contacts/existingContacts';
import { createContactAsyncAction, loadContactFromHrmByTaskSidAsyncAction } from '../states/contacts/saveContact';
import { namespace } from '../states/storeNamespaces';
import { isRouteModal } from '../states/routing/types';
import { getCurrentBaseRoute } from '../states/routing/getRoute';
import { getUnsavedContact } from '../states/contacts/getUnsavedContact';
import ContactNotLoaded from './ContactNotLoaded';
import { completeTask } from '../services/formSubmissionHelpers';
import { newContact } from '../states/contacts/contactState';
import asyncDispatch from '../states/asyncDispatch';
import { selectIsContactCreating } from '../states/contacts/selectContactSaveStatus';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// eslint-disable-next-line sonarjs/cognitive-complexity
const TaskView: React.FC<Props> = props => {
  const {
    shouldRecreateState,
    currentDefinitionVersion,
    task,
    unsavedContact,
    updateHelpline,
    loadContactFromHrmByTaskSid,
    createContact,
    isModalOpen,
    contactIsCreating,
  } = props;

  React.useEffect(() => {
    if (shouldRecreateState) {
      if (isOfflineContactTask(task)) {
        loadContactFromHrmByTaskSid();
      } else if (TaskHelper.isTaskAccepted(task) && hasTaskControl(task)) {
        createContact(currentDefinitionVersion);
      }
    }
  }, [createContact, currentDefinitionVersion, loadContactFromHrmByTaskSid, shouldRecreateState, task]);

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
        <HrmForm task={task} featureFlags={featureFlags} />
      </Flex>
    </Flex>
  );
};

TaskView.displayName = 'TaskView';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const {
    [namespace]: { configuration, activeContacts, routing, searchContacts },
  } = state;
  const { task } = ownProps;
  const { currentDefinitionVersion } = configuration;
  // Check if the entry for this task exists in each reducer
  const { savedContact, draftContact } =
    (task && Object.values(activeContacts.existingContacts).find(c => c.savedContact?.taskId)) ?? {};
  const unsavedContact = getUnsavedContact(savedContact, draftContact);
  const contactFormStateExists = Boolean(savedContact);
  const routingStateExists = Boolean(task && routing.tasks[task.taskSid]);
  const searchStateExists = Boolean(task && searchContacts.tasks[task.taskSid]);
  const contactIsCreating = selectIsContactCreating(state, task.taskSid);

  const shouldRecreateState =
    currentDefinitionVersion && (!contactFormStateExists || !routingStateExists || !searchStateExists);

  return {
    unsavedContact,
    shouldRecreateState,
    currentDefinitionVersion,
    isModalOpen: routingStateExists && isRouteModal(getCurrentBaseRoute(routing, task.taskSid)),
    contactIsCreating,
  };
};

const mapDispatchToProps = (dispatch, { task }: OwnProps) => ({
  loadContactFromHrmByTaskSid: () => dispatch(loadContactFromHrmByTaskSidAsyncAction(task.taskSid)),
  createContact: (definition: DefinitionVersion) =>
    asyncDispatch(dispatch)(createContactAsyncAction(newContact(definition, task), getHrmConfig().workerSid, task)),
  updateHelpline: (contactId: string, helpline: string) => dispatch(updateDraft(contactId, { helpline })),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(TaskView);
