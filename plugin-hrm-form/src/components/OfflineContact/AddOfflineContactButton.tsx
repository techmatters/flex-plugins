/**
 * Copyright (C) 2021-2025 Technology Matters
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
import React, { useEffect, useState, useCallback } from 'react';
import { Actions } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '../../states';
import { Contact } from '../../types/types';
import AddTaskButton from '../common/AddTaskButton';
import { getOfflineContactTask } from '../../states/contacts/offlineContactTask';
import { getHrmConfig, getTemplateStrings } from '../../hrmConfig';
import { newContact } from '../../states/contacts/contactState';
import asyncDispatch from '../../states/asyncDispatch';
import { createOfflineContactAsyncAction } from '../../states/contacts/saveContact';
import selectCurrentOfflineContact from '../../states/contacts/selectCurrentOfflineContact';
import { selectCurrentDefinitionVersion } from '../../states/configuration/selectDefinitions';

const AddOfflineContactButton: React.FC = () => {
  const dispatch = useDispatch();

  const currentDefinitionVersion = useSelector(selectCurrentDefinitionVersion);
  const isAddingOfflineContact = useSelector((state: RootState) => Boolean(selectCurrentOfflineContact(state)));

  const [errorTimer, setErrorTimer] = useState<number | null>(null);

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
  const createContactState = useCallback(
    async (contact: Contact) => {
      const asyncDispatcher = asyncDispatch(dispatch);
      await asyncDispatcher(
        createOfflineContactAsyncAction(contact, getHrmConfig().workerSid, getOfflineContactTask()),
      );
    },
    [dispatch],
  );

  if (!currentDefinitionVersion) {
    return null;
  }

  const onClick = async () => {
    console.log('Onclick - creating contact');
    const contactToCreate = newContact(currentDefinitionVersion);
    contactToCreate.rawJson.contactlessTask.createdOnBehalfOf = getHrmConfig().workerSid;

    await createContactState(contactToCreate);
    await Actions.invokeAction('SelectTask', { task: undefined });

    // Temporary hack: show an error if no offline contact opens after 5 seconds
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

export default AddOfflineContactButton;
