/* eslint-disable react/prop-types */
import React from 'react';
import { Notifications, TaskHelper, Actions } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { configurationBase, namespace, RootState, routingBase } from '../../states';
import type { ContactFormDefinition } from '../../states/types';
import * as GeneralActions from '../../states/actions';
import { offlineContactTaskSid } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactButton: React.FC<Props> = ({
  selectedTaskSid,
  addOfflineContact,
  currentDefinitionVersion,
  recreateContactState,
}) => {
  const onClick = async () => {
    await Actions.invokeAction('SelectTask', { task: undefined });
    recreateContactState(currentDefinitionVersion.tabbedForms)(offlineContactTaskSid);
  };

  const disabled = !selectedTaskSid && addOfflineContact;

  return <AddTaskButton onClick={onClick} disabled={disabled} label="OfflineContactButtonText" />;
};

OfflineContactButton.displayName = 'OfflineContactButton';

const mapStateToProps = (state: RootState) => {
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  const { addOfflineContact } = state[namespace][routingBase];
  const { selectedTaskSid } = state.flex.view;

  return {
    selectedTaskSid,
    addOfflineContact,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  recreateContactState: (definitions: ContactFormDefinition) => (taskId: string) =>
    dispatch(GeneralActions.recreateContactState(definitions)(taskId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(OfflineContactButton);
