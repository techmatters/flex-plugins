/* eslint-disable react/prop-types */
import React from 'react';
import { Actions } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { configurationBase, namespace, RootState, routingBase } from '../../states';
import type { ContactFormDefinition } from '../../states/types';
import * as GeneralActions from '../../states/actions';
import { offlineContactTaskSid } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';
import { reRenderAgentDesktop } from '../../HrmFormPlugin';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const OfflineContactButton: React.FC<Props> = ({
  selectedTaskSid,
  isAddingOfflineContact,
  currentDefinitionVersion,
  recreateContactState,
}) => {
  const onClick = async () => {
    recreateContactState(currentDefinitionVersion.tabbedForms)(offlineContactTaskSid);
    await Actions.invokeAction('SelectTask', { task: undefined });
    await reRenderAgentDesktop();
  };

  const disabled = !selectedTaskSid && isAddingOfflineContact;

  return <AddTaskButton onClick={onClick} disabled={disabled} label="OfflineContactButtonText" />;
};

OfflineContactButton.displayName = 'OfflineContactButton';

const mapStateToProps = (state: RootState) => {
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  const { isAddingOfflineContact } = state[namespace][routingBase];
  const { selectedTaskSid } = state.flex.view;

  return {
    selectedTaskSid,
    isAddingOfflineContact,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  recreateContactState: (definitions: ContactFormDefinition) => (taskId: string) =>
    dispatch(GeneralActions.recreateContactState(definitions)(taskId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(OfflineContactButton);
