/* eslint-disable react/prop-types */
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { TaskHelper } from '@twilio/flex-ui';

import HrmForm from './HrmForm';
import FormNotEditable from './FormNotEditable';
import { RootState, namespace, contactFormsBase, searchContactsBase, routingBase, configurationBase } from '../states';
import * as GeneralActions from '../states/actions';
import { hasTaskControl } from '../utils/transfer';
import type { ContactFormDefinition } from '../states/types';
import { CustomITask, isOfflineContactTask, isInMyBehalfITask } from '../types/types';
import { reRenderAgentDesktop } from '../HrmFormPlugin';
import PreviousContactsBanner from './PreviousContactsBanner';

type OwnProps = {
  task: CustomITask;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const TaskView: React.FC<Props> = props => {
  const { shouldRecreateState, currentDefinitionVersion, task, recreateContactState } = props;

  React.useEffect(() => {
    if (shouldRecreateState) {
      recreateContactState(currentDefinitionVersion.tabbedForms)(task.taskSid);
    }
  }, [currentDefinitionVersion.tabbedForms, recreateContactState, shouldRecreateState, task.taskSid]);

  // Force a re-render on unmount (temporary fix NoTaskView issue with Offline Contacts)
  React.useEffect(() => {
    return () => {
      if (isOfflineContactTask(task)) reRenderAgentDesktop();
    };
  }, [task]);

  // If this task is not the active task, or if the task is not accepted yet, hide it
  const show =
    task &&
    !shouldRecreateState &&
    !isInMyBehalfITask(task) &&
    (isOfflineContactTask(task) || !TaskHelper.isPending(task));

  if (!show) return null;

  return (
    <div style={{ height: '100%' }}>
      <PreviousContactsBanner task={task} />
      {!hasTaskControl(task) && <FormNotEditable />}
      <HrmForm task={task} />
    </div>
  );
};

TaskView.displayName = 'TaskView';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { task } = ownProps;
  // Check if the entry for this task exists in each reducer
  const contactFormStateExists = Boolean(task && state[namespace][contactFormsBase].tasks[task.taskSid]);
  const routingStateExists = Boolean(task && state[namespace][routingBase].tasks[task.taskSid]);
  const searchStateExists = Boolean(task && state[namespace][searchContactsBase].tasks[task.taskSid]);

  const shouldRecreateState = !contactFormStateExists || !routingStateExists || !searchStateExists;
  const { currentDefinitionVersion } = state[namespace][configurationBase];

  return {
    shouldRecreateState,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  recreateContactState: (definitions: ContactFormDefinition) => (taskId: string) =>
    dispatch(GeneralActions.recreateContactState(definitions)(taskId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(TaskView);
