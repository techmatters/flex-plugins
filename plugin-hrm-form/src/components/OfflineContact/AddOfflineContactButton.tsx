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

import { RootState } from '../../states';
import { Contact } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';
import getOfflineContactTaskSid from '../../states/contacts/offlineContactTaskSid';
import { getHrmConfig } from '../../hrmConfig';
import { newContact } from '../../states/contacts/contactState';
import asyncDispatch from '../../states/asyncDispatch';
import { createContactAsyncAction, newRestartOfflineContactAsyncAction } from '../../states/contacts/saveContact';
import { namespace } from '../../states/storeNamespaces';
import findContactByTaskSid from '../../states/contacts/findContactByTaskSid';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const AddOfflineContactButton: React.FC<Props> = ({
  isAddingOfflineContact,
  currentDefinitionVersion,
  createContactState,
  restartContact,
  draftOfflineContact,
}) => {
  if (!currentDefinitionVersion) {
    return null;
  }

  const onClick = async () => {
    console.log('Onclick - creating contact');
    if (draftOfflineContact) {
      await restartContact(draftOfflineContact);
    } else {
      await createContactState(newContact(currentDefinitionVersion));
    }
    await Actions.invokeAction('SelectTask', { task: undefined });
    // await rerenderAgentDesktop();
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
  const draftOfflineContact = findContactByTaskSid(state, getOfflineContactTaskSid())?.savedContact;
  const { currentDefinitionVersion } = state[namespace].configuration;
  const { isAddingOfflineContact } = state[namespace].routing;

  return {
    isAddingOfflineContact,
    currentDefinitionVersion,
    draftOfflineContact,
  };
};

const mapDispatchToProps = dispatch => {
  const asyncDispatcher = asyncDispatch(dispatch);
  return {
    createContactState: (contact: Contact) =>
      asyncDispatcher(createContactAsyncAction(contact, getHrmConfig().workerSid, getOfflineContactTaskSid())),
    restartContact: (contact: Contact) =>
      asyncDispatcher(newRestartOfflineContactAsyncAction(contact, getHrmConfig().workerSid)),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddOfflineContactButton);
