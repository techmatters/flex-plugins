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
import { reRenderAgentDesktop, getConfig } from '../HrmFormPlugin';
import PreviousContactsBanner from './PreviousContactsBanner';
import { Flex } from '../styles/HrmStyles';
import { isStandaloneITask } from './case/Case';
import { getHelplineToSave } from '../services/formSubmissionHelpers';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TaskView: React.FC<Props> = props => {
  const {
    shouldRecreateState,
    currentDefinitionVersion,
    task,
    contactForm,
    updateHelpline,
    recreateContactState,
  } = props;

  React.useEffect(() => {
    if (shouldRecreateState) {
      recreateContactState(currentDefinitionVersion)(task.taskSid);
    }
  }, [currentDefinitionVersion, recreateContactState, shouldRecreateState, task.taskSid]);

  // Force a re-render on unmount (temporary fix NoTaskView issue with Offline Contacts)
  React.useEffect(() => {
    return () => {
      if (isOfflineContactTask(task)) reRenderAgentDesktop();
    };
  }, [task]);

  const contactlessTask = contactForm && contactForm.contactlessTask;

  React.useEffect(() => {
    const fetchHelpline = async () => {
      if (task && contactlessTask && !isStandaloneITask(task)) {
        const helplineToSave = await getHelplineToSave(task, contactlessTask || {});
        updateHelpline(task.taskSid, helplineToSave);
      }
    };

    fetchHelpline();
  }, [task, contactlessTask, updateHelpline]);

  // If this task is not the active task, or if the task is not accepted yet, hide it
  const show =
    task &&
    !shouldRecreateState &&
    !isInMyBehalfITask(task) &&
    (isOfflineContactTask(task) || !TaskHelper.isPending(task));

  if (!show) return null;

  const { featureFlags } = getConfig();

  return (
    <Flex flexDirection="column" height="100%">
      {featureFlags.enable_previous_contacts && <PreviousContactsBanner task={task} />}
      {!hasTaskControl(task) && <FormNotEditable />}
      <HrmForm task={task} />
    </Flex>
  );
};

TaskView.displayName = 'TaskView';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { task } = ownProps;
  // Check if the entry for this task exists in each reducer
  const contactForm = task && state[namespace][contactFormsBase]?.tasks[task.taskSid];
  const contactFormStateExists = Boolean(contactForm);
  const routingStateExists = Boolean(task && state[namespace][routingBase].tasks[task.taskSid]);
  const searchStateExists = Boolean(task && state[namespace][searchContactsBase].tasks[task.taskSid]);

  const shouldRecreateState = !contactFormStateExists || !routingStateExists || !searchStateExists;
  const { currentDefinitionVersion } = state[namespace][configurationBase];

  return {
    contactForm,
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
