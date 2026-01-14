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

import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import { AnyAction } from 'redux';

import { RootState } from '../../states';
import { BottomButtonBar, Box, PrimaryButton } from '../../styles';
import { EditContactContainer } from '../case/styles';
import { recordBackendError, recordingErrorHandler } from '../../fullStory';
import { DetailsContext } from '../../states/contacts/contactDetails';
import {
  clearDraft,
  ContactDraftChanges,
  newSetContactDialogStateAction,
} from '../../states/contacts/existingContacts';
import CloseCaseDialog from '../case/CloseCaseDialog';
import { getTemplateStrings } from '../../hrmConfig';
import { Contact, ContactRawJson, CustomITask, StandaloneITask } from '../../types/types';
import asyncDispatch from '../../states/asyncDispatch';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import { namespace } from '../../states/storeNamespaces';
import { newGoBackAction } from '../../states/routing/actions';

type Props = {
  context: DetailsContext;
  contactId: string;
  task: CustomITask | StandaloneITask;
  children: React.ReactNode;
  tabPath: keyof ContactRawJson;
  onClose: () => void;
};

const EditContactSection: React.FC<Props> = ({ contactId, task, children, tabPath, onClose }) => {
  const dispatch = useDispatch();
  const contactState = useSelector((state: RootState) => state[namespace].activeContacts.existingContacts[contactId]);
  const definitionVersions = useSelector((state: RootState) => state[namespace].configuration.definitionVersions);
  const savedContact = contactState?.savedContact;
  const draftContact = contactState?.draftContact;
  const confirmCloseDialogOpen = Boolean(contactState?.metadata?.draft?.dialogsOpen?.[`${tabPath}-confirm-close`]);
  const confirmBackDialogOpen = Boolean(contactState?.metadata?.draft?.dialogsOpen?.[`${tabPath}-confirm-back`]);

  const goBack = () => dispatch(newGoBackAction(task.taskSid));
  const updateContactsFormInHrmAsyncAction = async (contact: Contact, changes: ContactDraftChanges) => {
    await asyncDispatch<AnyAction>(dispatch)(updateContactInHrmAsyncAction(contact, changes));
  };
  const closeDialog = (dismissAction: 'close' | 'back') =>
    dispatch(newSetContactDialogStateAction(contactId, `${tabPath}-confirm-${dismissAction}`, false));
  const clearContactDraft = () => {
    dispatch(clearDraft(contactId));
  };
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onSubmit',
  });
  const strings = getTemplateStrings();

  const version = savedContact?.definitionVersion ?? savedContact?.rawJson.definitionVersion;

  const definitionVersion = definitionVersions[version];

  const [isSubmitting, setSubmitting] = useState(false);

  if (!savedContact || !definitionVersion) return null;

  const onSubmitValidForm = async (closeAction: () => void) => {
    setSubmitting(true);
    try {
      updateContactsFormInHrmAsyncAction(savedContact, draftContact);
      closeAction();
    } catch (error) {
      setSubmitting(false);
      recordBackendError('Open New Case', error);
      window.alert(strings['Error-Backend']);
    }
  };

  const onError = recordingErrorHandler('Edit Contact Form', () => {
    window.alert(strings['Error-Form']);
  });

  const onSubmitForm = methods.handleSubmit(() => onSubmitValidForm(goBack), onError);
  const dialogName = confirmCloseDialogOpen ? 'close' : 'back';
  return (
    <EditContactContainer>
      <FormProvider {...methods}>
        {children}
        <BottomButtonBar>
          <Box marginRight="15px">
            <CloseCaseDialog
              data-testid="CloseCaseDialog"
              openDialog={confirmCloseDialogOpen || confirmBackDialogOpen}
              setDialog={() => closeDialog(dialogName)}
              handleDontSaveClose={() => {
                closeDialog(dialogName);
                clearContactDraft();
                if (confirmCloseDialogOpen) {
                  onClose();
                } else {
                  goBack();
                }
              }}
              handleSaveUpdate={methods.handleSubmit(() => {
                closeDialog(dialogName);
                onSubmitValidForm(confirmCloseDialogOpen ? onClose : goBack);
              }, onError)}
            />
          </Box>
          <Box marginRight="15px">
            <PrimaryButton
              roundCorners={true}
              onClick={onSubmitForm}
              disabled={isSubmitting}
              data-fs-id="Contact-SaveContact-Button"
              data-testid="EditContact-SaveContact-Button"
            >
              <span style={{ visibility: isSubmitting ? 'hidden' : 'inherit' }}>
                {/* eslint-disable-next-line react/jsx-max-depth */}
                <Template code="BottomBar-SaveContact" />
              </span>
              {isSubmitting ? <CircularProgress size={12} style={{ position: 'absolute' }} /> : null}
            </PrimaryButton>
          </Box>
        </BottomButtonBar>
      </FormProvider>
    </EditContactContainer>
  );
};

export default EditContactSection;
