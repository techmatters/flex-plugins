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
import { Contact, offlineContactTaskSid } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';
import { rerenderAgentDesktop } from '../../rerenderView';
import { newContactState } from '../../states/contacts/reducer';
import { createContact } from '../../services/ContactService';
import { getHrmConfig } from '../../hrmConfig';
import { ContactMetadata } from '../../states/contacts/types';
import { loadContact } from '../../states/contacts/existingContacts';

type OwnProps = {};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const AddOfflineContactButton: React.FC<Props> = ({
  isAddingOfflineContact,
  currentDefinitionVersion,
  recreateContactState,
  addReferenceToContactState,
}) => {
  if (!currentDefinitionVersion) {
    return null;
  }

  const loadOrCreateContact = async () => {
    const { savedContact: newContact, metadata } = newContactState(currentDefinitionVersion)(true);
    const savedContact = await createContact(newContact, getHrmConfig().workerSid, offlineContactTaskSid);
    recreateContactState(currentDefinitionVersion)(savedContact, metadata);
    addReferenceToContactState(savedContact);
  };

  const onClick = async () => {
    await loadOrCreateContact();
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
  recreateContactState: (definitions: DefinitionVersion) => (contact: Contact, metadata: ContactMetadata) => {
    dispatch(GeneralActions.recreateContactState(definitions)(contact, metadata));
  },
  addReferenceToContactState: (contact: Contact) => {
    dispatch(loadContact(contact, offlineContactTaskSid));
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(AddOfflineContactButton);
