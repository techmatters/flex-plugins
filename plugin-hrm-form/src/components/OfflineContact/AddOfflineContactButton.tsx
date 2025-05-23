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
import React, { useEffect } from 'react';
import { Actions } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';

import { RootState } from '../../states';
import { Contact } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';
import { getOfflineContactTask, getOfflineContactTaskSid } from '../../states/contacts/offlineContactTask';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { newContact } from '../../states/contacts/contactState';
import asyncDispatch from '../../states/asyncDispatch';
import { createContactAsyncAction } from '../../states/contacts/saveContact';
import { namespace } from '../../states/storeNamespaces';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import selectCurrentOfflineContact from '../../states/contacts/selectCurrentOfflineContact';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const AddOfflineContactButton: React.FC<Props> = ({
  isAddingOfflineContact,
  currentDefinitionVersion,
  createContactState,
}) => {
  const [errorTimer, setErrorTimer] = React.useState<any>(null);

  useEffect(() => {
    if (isAddingOfflineContact && errorTimer) {
      clearTimeout(errorTimer);
      setErrorTimer(null);
    }
    return () => {
      if (errorTimer) {
        clearTimeout(errorTimer);
      }
    };
  }, [isAddingOfflineContact, errorTimer]);
  if (!currentDefinitionVersion) {
    return null;
  }

  const onClick = async () => {
    console.log('Onclick - creating contact');
    const contactToCreate = newContact(currentDefinitionVersion);
    contactToCreate.rawJson.contactlessTask.createdOnBehalfOf = getHrmConfig().workerSid;
    await createContactState(contactToCreate);
    await Actions.invokeAction('SelectTask', { task: undefined });
    // This is a temporary hack to show an error if it hasn't opened an offline contact to edit in 5 seconds
    // When we add proper loading / error state to our redux contacts we can replace this
    setErrorTimer(
      setTimeout(() => {
        alert(getTemplateStrings()['TaskList-AddOfflineContact-CreateError']);
        setErrorTimer(null);
      }, 5000),
    );
  };

  return (
    <AddTaskButton
      onClick={onClick}
      disabled={Boolean(isAddingOfflineContact || errorTimer)}
      label="OfflineContactButtonText"
      data-fs-id="Task-AddOfflineContact-Button"
    />
  );
};

AddOfflineContactButton.displayName = 'AddOfflineContactButton';

const mapStateToProps = (state: RootState) => {
  const draftOfflineContact = selectContactByTaskSid(state, getOfflineContactTaskSid())?.savedContact;
  const { currentDefinitionVersion } = state[namespace].configuration;
  const isAddingOfflineContact = Boolean(selectCurrentOfflineContact(state));

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
      asyncDispatcher(createContactAsyncAction(contact, getHrmConfig().workerSid, getOfflineContactTask())),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddOfflineContactButton);
