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
import { Contact } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';
import getOfflineContactTaskSid from '../../states/contacts/offlineContactTaskSid';
import { getHrmConfig } from '../../hrmConfig';
import { newContact } from '../../states/contacts/contactState';
import asyncDispatch from '../../states/asyncDispatch';
import { createContactAsyncAction } from '../../states/contacts/saveContact';
import { rerenderAgentDesktop } from '../../rerenderView';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const AddOfflineContactButton: React.FC<Props> = ({
  isAddingOfflineContact,
  currentDefinitionVersion,
  createContactState,
}) => {
  if (!currentDefinitionVersion) {
    return null;
  }

  const onClick = async () => {
    console.log('Onclick - creating contact');
    createContactState(newContact(currentDefinitionVersion));

    await Actions.invokeAction('SelectTask', { task: undefined });
    await rerenderAgentDesktop();
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

const mapStateToProps = (state: RootState) => {
  const { currentDefinitionVersion } = state[namespace][configurationBase];
  const { isAddingOfflineContact } = state[namespace][routingBase];

  return {
    isAddingOfflineContact,
    currentDefinitionVersion,
  };
};

const mapDispatchToProps = dispatch => ({
  createContactState: (contact: Contact) => {
    asyncDispatch(dispatch)(createContactAsyncAction(contact, getHrmConfig().workerSid, getOfflineContactTaskSid()));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddOfflineContactButton);
