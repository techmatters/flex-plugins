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

import { connect, ConnectedProps } from 'react-redux';
import React, { Dispatch, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Template } from '@twilio/flex-ui';
import { CircularProgress } from '@material-ui/core';
import { AnyAction } from 'redux';

import { RootState } from '../../states';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles';
import { EditContactContainer } from '../case/styles';
import { recordBackendError, recordingErrorHandler } from '../../fullStory';
import { DetailsContext } from '../../states/contacts/contactDetails';
import {
  clearDraft,
  ContactDraftChanges,
  newSetContactDialogStateAction,
  refreshContact,
} from '../../states/contacts/existingContacts';
import CloseCaseDialog from '../case/CloseCaseDialog';
import { getTemplateStrings } from '../../hrmConfig';
import { Contact, ContactRawJson, CustomITask, StandaloneITask } from '../../types/types';
import asyncDispatch from '../../states/asyncDispatch';
import { updateContactInHrmAsyncAction } from '../../states/contacts/saveContact';
import { namespace } from '../../states/storeNamespaces';
import { newGoBackAction } from '../../states/routing/actions';

type OwnProps = {
  context: DetailsContext;
  contactId: string;
  task: CustomITask | StandaloneITask;
  children: React.ReactNode;
  tabPath: keyof ContactRawJson;
  onClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const EditContactSection: React.FC<Props> = ({
  savedContact,
  draftContact,
  definitionVersions,
  children,
  clearContactDraft,
  goBack,
  onClose,
  updateContactsFormInHrmAsyncAction,
  confirmCloseDialogOpen,
  confirmBackDialogOpen,
  closeDialog,
}) => {
  const methods = useForm({
    shouldFocusError: false,
    mode: 'onSubmit',
  });
  const strings = getTemplateStrings();

  const version = savedContact?.rawJson.definitionVersion;

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
            <StyledNextStepButton
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
            </StyledNextStepButton>
          </Box>
        </BottomButtonBar>
      </FormProvider>
    </EditContactContainer>
  );
};

const mapDispatchToProps = (
  dispatch: Dispatch<{ type: string } & Record<string, any>>,
  { contactId, task, tabPath }: OwnProps,
) => {
  const updateContactAsyncDispatch = asyncDispatch<AnyAction>(dispatch);
  return {
    refreshContact: contact => dispatch(refreshContact(contact)),
    goBack: () => dispatch(newGoBackAction(task.taskSid)),
    updateContactsFormInHrmAsyncAction: async (contact: Contact, changes: ContactDraftChanges) => {
      await updateContactAsyncDispatch(updateContactInHrmAsyncAction(contact, changes));
    },
    closeDialog: (dismissAction: 'close' | 'back') =>
      dispatch(newSetContactDialogStateAction(contactId, `${tabPath}-confirm-${dismissAction}`, false)),
    clearContactDraft: () => {
      dispatch(clearDraft(contactId));
    },
  };
};

const mapStateToProps = (
  { [namespace]: { activeContacts, configuration } }: RootState,
  { contactId, tabPath }: OwnProps,
) => {
  const contactState = activeContacts.existingContacts[contactId];
  return {
    definitionVersions: configuration.definitionVersions,
    counselorsHash: configuration.counselors.hash,
    savedContact: contactState?.savedContact,
    draftContact: contactState?.draftContact,
    confirmCloseDialogOpen: Boolean(contactState?.metadata?.draft?.dialogsOpen?.[`${tabPath}-confirm-close`]),
    confirmBackDialogOpen: Boolean(contactState?.metadata?.draft?.dialogsOpen?.[`${tabPath}-confirm-back`]),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(EditContactSection);

export default connected;
