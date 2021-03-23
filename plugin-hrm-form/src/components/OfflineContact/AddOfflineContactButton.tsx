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

const AddOfflineContactButton: React.FC<Props> = ({
  isAddingOfflineContact,
  currentDefinitionVersion,
  recreateContactState,
}) => {
  const onClick = async () => {
    recreateContactState(currentDefinitionVersion.tabbedForms)(offlineContactTaskSid);
    await Actions.invokeAction('SelectTask', { task: undefined });
    await reRenderAgentDesktop();
  };

  return <AddTaskButton onClick={onClick} disabled={isAddingOfflineContact} label="OfflineContactButtonText" />;
};

AddOfflineContactButton.displayName = 'AddOfflineContactButton';

const mapStateToProps = (state: RootState) => {
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  const { isAddingOfflineContact } = state[namespace][routingBase];

  return {
    isAddingOfflineContact,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  recreateContactState: (definitions: ContactFormDefinition) => (taskId: string) =>
    dispatch(GeneralActions.recreateContactState(definitions)(taskId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddOfflineContactButton);
