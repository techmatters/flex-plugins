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
import { Actions } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { configurationBase, namespace, RootState, routingBase } from '../../states';
import type { DefinitionVersion } from '../../states/types';
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
    recreateContactState(currentDefinitionVersion)(offlineContactTaskSid);
    await Actions.invokeAction('SelectTask', { task: undefined });
    await reRenderAgentDesktop();
  };

  return (
    <AddTaskButton
      onClick={onClick}
      disabled={isAddingOfflineContact}
      label="OfflineContactButtonText"
      data-fs-id="Task-AddOfflineContact-Button"
    />
  );
};

AddOfflineContactButton.displayName = 'AddOfflineContactButton';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  const { isAddingOfflineContact } = state[namespace][routingBase];

  return {
    isAddingOfflineContact,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  recreateContactState: (definitions: DefinitionVersion) => (taskId: string) =>
    dispatch(GeneralActions.recreateContactState(definitions)(taskId)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddOfflineContactButton);
