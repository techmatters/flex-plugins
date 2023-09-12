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
import { bindActionCreators } from 'redux';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { RootState, namespace, contactFormsBase, searchContactsBase, routingBase, configurationBase } from '../states';
import * as GeneralActions from '../states/actions';
import { updateHelpline as updateHelplineAction } from '../states/contacts/actions';
import { hasTaskControl } from '../utils/transfer';
import type { DefinitionVersion } from '../states/types';
import { CustomITask, isOfflineContactTask, isInMyBehalfITask } from '../types/types';
import PreviousContactsBanner from './PreviousContactsBanner';
import { Flex } from '../styles/HrmStyles';
import { isStandaloneITask } from './case/Case';
import { getHelplineToSave } from '../services/HelplineService';
import { getAseloFeatureFlags } from '../hrmConfig';
import { rerenderAgentDesktop } from '../rerenderView';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

// eslint-disable-next-line sonarjs/cognitive-complexity
const TaskView: React.FC<Props> = props => {
  const { shouldRecreateState, currentDefinitionVersion, task, contact, updateHelpline, recreateContactState } = props;

  React.useEffect(() => {
    if (shouldRecreateState) {
      recreateContactState(currentDefinitionVersion)(task.taskSid);
    }
  }, [currentDefinitionVersion, recreateContactState, shouldRecreateState, task.taskSid]);

  // Force a re-render on unmount (temporary fix NoTaskView issue with Offline Contacts)
  React.useEffect(() => {
    return () => {
      if (isOfflineContactTask(task)) rerenderAgentDesktop();
    };
  }, [task]);

  const contactInitialized = Boolean(contact);
  const helpline = contact?.helpline;
  const contactlessTask = contact?.rawJson?.contactlessTask;

  // Set contactForm.helpline for all contacts on the first run. React to helpline changes for offline contacts only
  React.useEffect(() => {
    const setHelpline = async () => {
      if (task && !isStandaloneITask(task)) {
        const helplineToSave = await getHelplineToSave(task, contactlessTask);
        if (helpline !== helplineToSave) {
          updateHelpline(task.taskSid, helplineToSave);
        }
      }
    };

    // Only run setHelpline if a) contactForm.helpline is not set or b) if the task is an offline contact and contactlessTask.helpline has changed
    const helplineChanged = contactlessTask?.helpline && helpline !== contactlessTask.helpline;
    const shouldSetHelpline = contactInitialized && (!helpline || (isOfflineContactTask(task) && helplineChanged));

    if (shouldSetHelpline) {
      setHelpline();
    }
  }, [contactlessTask, contactInitialized, helpline, task, updateHelpline]);

  if (!currentDefinitionVersion) {
    return null;
  }

  // If this task is not the active task, or if the task is not accepted yet, hide it
  const show =
    task &&
    !shouldRecreateState &&
    !isInMyBehalfITask(task) &&
    (isOfflineContactTask(task) || !TaskHelper.isPending(task));

  if (!show) return null;

  const featureFlags = getAseloFeatureFlags();
  const isFormLocked = !hasTaskControl(task);

  return (
    <Flex flexDirection="column" style={{ pointerEvents: isFormLocked ? 'none' : 'auto', height: '100%' }}>
      {featureFlags.enable_previous_contacts && <PreviousContactsBanner task={task} />}
      {isFormLocked && <FormNotEditable />}
      <Flex
        flexDirection="column"
        style={{
          // This fixes a UI bug where the PreviousContactsBanner pushes the container down
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
  const { task } = ownProps;
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  // Check if the entry for this task exists in each reducer
  const { contact } = (task && state[namespace][contactFormsBase]?.tasks[task.taskSid]) ?? {};
  const contactFormStateExists = Boolean(contact);
  const routingStateExists = Boolean(task && state[namespace][routingBase].tasks[task.taskSid]);
  const searchStateExists = Boolean(task && state[namespace][searchContactsBase].tasks[task.taskSid]);

  const shouldRecreateState =
    currentDefinitionVersion && (!contactFormStateExists || !routingStateExists || !searchStateExists);

  return {
    contact,
    shouldRecreateState,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  recreateContactState: (definitions: DefinitionVersion) => (taskId: string) =>
    dispatch(GeneralActions.recreateContactState(definitions)(taskId)),
  updateHelpline: bindActionCreators(updateHelplineAction, dispatch),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(TaskView);
