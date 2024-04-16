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

import React, { Dispatch, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { callTypes, DataCallTypes, DefinitionVersion } from 'hrm-form-definitions';
import _ from 'lodash';

import ContactDetailsHome from './ContactDetailsHome';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { RootState } from '../../states';
import EditContactSection from './EditContactSection';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { DetailsContainer } from '../search/styles';
import * as ConfigActions from '../../states/configuration/actions';
import { ContactDetailsSectionFormApi, contactDetailsSectionFormApi } from './contactDetailsSectionFormApi';
import ContactDetailsSectionForm from './ContactDetailsSectionForm';
import IssueCategorizationSectionForm from './IssueCategorizationSectionForm';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { loadContactFromHrmByIdAsyncAction } from '../../states/contacts/saveContact';
import {
  clearDraft,
  newSetContactDialogStateAction,
  releaseContact,
  updateDraft,
} from '../../states/contacts/existingContacts';
import CSAMReport from '../CSAMReport/CSAMReport';
import { existingContactCSAMApi } from '../CSAMReport/csamReportApi';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';
import { namespace } from '../../states/storeNamespaces';
import { ContactRawJson, CustomITask, StandaloneITask } from '../../types/types';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import NavigableContainer from '../NavigableContainer';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import { newCloseModalAction, newGoBackAction } from '../../states/routing/actions';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';
import ConnectDialog from '../search/ConnectDialog';
import { hasTaskControl } from '../../transfer/transferTaskState';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { selectDefinitionVersions } from '../../states/configuration/selectDefinitions';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';

type OwnProps = {
  contactId: string;
  context: DetailsContext;
  onConfirmConnectDialog?: (calltype: DataCallTypes) => void;
  enableEditing?: boolean;
  task: CustomITask | StandaloneITask;
  onClose?: () => void;
};

const mapDispatchToProps = (
  dispatch: Dispatch<{ type: string } & Record<string, any>>,
  { contactId, task }: OwnProps,
) => ({
  updateDefinitionVersion: (version: string, definitionVersion: DefinitionVersion) =>
    dispatch(ConfigActions.updateDefinitionVersion(version, definitionVersion)),
  updateDraftForm: (draftContactId: string, form: Partial<ContactRawJson>) =>
    dispatch(updateDraft(draftContactId, { rawJson: form })),
  closeModal: () => dispatch(newCloseModalAction(task.taskSid)),
  clearContactDraft: () => {
    dispatch(clearDraft(contactId));
  },
  goBack: () => dispatch(newGoBackAction(task.taskSid)),
  openFormConfirmDialog: (form: keyof ContactRawJson, dismissAction: 'close' | 'back') =>
    dispatch(newSetContactDialogStateAction(contactId, `${form}-confirm-${dismissAction}`, true)),
  loadContactFromHrm: () => dispatch(loadContactFromHrmByIdAsyncAction(contactId, `${task.taskSid}-viewing`)),

  releaseContactFromState: () => dispatch(releaseContact(contactId, `${task.taskSid}-viewing`)),
});

const mapStateToProps = (state: RootState, { contactId, task }: OwnProps) => {
  const currentRoute = selectCurrentTopmostRouteForTask(state, task.taskSid);
  const { savedContact: taskContact } = selectContactByTaskSid(state, task.taskSid) ?? {};
  const { savedContact, draftContact, metadata } = selectContactStateByContactId(state, contactId) ?? {};
  return {
    definitionVersions: selectDefinitionVersions(state),
    savedContact,
    draftContact,
    loadingStatus: metadata?.loadingStatus,
    draftCsamReport: state[namespace]['csam-report'].contacts[contactId],
    currentRoute,
    taskContact,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetails: React.FC<Props> = ({
  context,
  contactId,
  definitionVersions,
  updateDefinitionVersion,
  savedContact,
  draftContact,
  taskContact,
  enableEditing = true,
  draftCsamReport,
  updateDraftForm,
  task,
  onClose = () => undefined,
  closeModal,
  goBack,
  clearContactDraft,
  currentRoute,
  openFormConfirmDialog,
  loadingStatus,
  loadContactFromHrm,
  onConfirmConnectDialog = () => undefined,
  ...otherProps
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  React.useEffect(() => {
    // No conversationMedia means we've only loaded contact info required for the list, not the full contact, do a full load
    if (!savedContact?.conversationMedia && loadingStatus !== 'loading') {
      loadContactFromHrm();
    }
  }, [loadingStatus, savedContact, loadContactFromHrm]);
  const version = savedContact?.rawJson.definitionVersion;

  const featureFlags = getAseloFeatureFlags();
  const strings = getTemplateStrings();
  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  React.useEffect(() => {
    const fetchDefinitionVersions = async () => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions();
    }
  }, [definitionVersions, updateDefinitionVersion, version, savedContact]);

  const definitionVersion = definitionVersions[version];

  const [connectDialogAnchorEl, setConnectDialogAnchorEl] = useState(null);
  const [callTypeInfoToCopy, setCallTypeInfoToCopy] = useState<DataCallTypes>(null);

  if (!definitionVersion || !savedContact)
    return (
      <DetailsContainer>
        <CircularProgress size={50} />
      </DetailsContainer>
    );

  const childOrUnknown = contactLabelFromHrmContact(definitionVersion, savedContact, {
    substituteForId: false,
  });

  // With tabPath as an input, this function returns the localized string for section's title
  const editContactSectionTitle = (tabPath: keyof ContactRawJson): string => {
    if (tabPath === 'callerInformation') {
      return strings['Contact-EditCaller'];
    } else if (tabPath === 'childInformation') {
      return strings['Contact-EditChild'];
    } else if (tabPath === 'categories') {
      return strings['Contact-EditCategories'];
    } else if (tabPath === 'caseInformation') {
      return strings['Contact-EditSummary'];
    }
    return '';
  };

  // With tabPath as an input, this function returns the localized string for section's title
  const editContactSectionApi = (tabPath: keyof ContactRawJson): ContactDetailsSectionFormApi => {
    if (tabPath === 'callerInformation') {
      return contactDetailsSectionFormApi.CALLER_INFORMATION;
    } else if (tabPath === 'childInformation') {
      return contactDetailsSectionFormApi.CHILD_INFORMATION;
    } else if (tabPath === 'caseInformation') {
      return contactDetailsSectionFormApi.CASE_INFORMATION;
    }
    return undefined;
  };

  const closeContactModal = () => {
    onClose();
    closeModal();
  };

  const onEditFormClose = (form: keyof ContactRawJson, dismissAction: 'close' | 'back') => () => {
    if (
      form === 'categories' ||
      _.isEqual(savedContact.rawJson[form], getUnsavedContact(savedContact, draftContact).rawJson[form])
    ) {
      clearContactDraft();
      if (dismissAction === 'close') {
        closeContactModal();
      } else {
        goBack();
      }
    } else {
      openFormConfirmDialog(form, dismissAction);
    }
  };

  const handleCloseDialog = () => {
    setConnectDialogAnchorEl(null);
    setCallTypeInfoToCopy(null);
  };

  const isCopyingCallerInformation =
    callTypeInfoToCopy === callTypes.caller &&
    taskContact?.rawJson.callType === callTypes.caller &&
    savedContact?.rawJson.callType === callTypes.caller;

  const handleConfirmDialog = () => {
    if (isCopyingCallerInformation) {
      updateDraftForm(taskContact.id, { callerInformation: savedContact.rawJson.callerInformation });
      onConfirmConnectDialog(callTypes.caller);
    } else {
      updateDraftForm(taskContact.id, { childInformation: savedContact.rawJson.childInformation });
      onConfirmConnectDialog(callTypes.child);
    }
  };

  const handleOpenConnectDialog = (e, callType: DataCallTypes) => {
    e.stopPropagation();
    setCallTypeInfoToCopy(callType);
    setConnectDialogAnchorEl(e.currentTarget);
  };

  const editContactSectionElement = (
    formPath: 'callerInformation' | 'childInformation' | 'caseInformation' | 'categories',
  ) => {
    const unsavedContact = getUnsavedContact(savedContact, draftContact);
    return (
      <NavigableContainer
        titleCode={editContactSectionTitle(formPath)}
        task={task}
        onCloseModal={onEditFormClose(formPath, 'close')}
        onGoBack={onEditFormClose(formPath, 'back')}
        {...otherProps}
      >
        <EditContactSection
          context={context}
          contactId={contactId}
          tabPath={formPath}
          task={task}
          onClose={closeContactModal}
        >
          {formPath === 'categories' ? (
            <IssueCategorizationSectionForm
              definition={definitionVersion.tabbedForms.IssueCategorizationTab(unsavedContact.helpline)}
              stateApi={forExistingContact(contactId)}
              display={true}
              autoFocus={true}
            />
          ) : (
            <ContactDetailsSectionForm
              tabPath={formPath}
              definition={editContactSectionApi(formPath).getFormDefinition(definitionVersion)}
              layoutDefinition={editContactSectionApi(formPath).getLayoutDefinition(definitionVersion)}
              initialValues={editContactSectionApi(formPath).getFormValues(definitionVersion, unsavedContact)[formPath]}
              display={true}
              autoFocus={false}
              updateForm={values =>
                updateDraftForm(savedContact.id, {
                  [formPath]: values[formPath],
                })
              }
              contactId={contactId}
            />
          )}
        </EditContactSection>
      </NavigableContainer>
    );
  };

  if (draftCsamReport) {
    return <CSAMReport api={existingContactCSAMApi(contactId)} />;
  }

  if (currentRoute.route === 'contact' && currentRoute.subroute === 'edit') {
    return editContactSectionElement(currentRoute.form);
  }

  return (
    <NavigableContainer
      titleCode={`#${contactId} ${childOrUnknown}`}
      onCloseModal={closeContactModal}
      task={task}
      {...otherProps}
    >
      {taskContact && (
        <ConnectDialog
          disabled={!hasTaskControl(task)}
          anchorEl={connectDialogAnchorEl}
          textTemplateCode={isCopyingCallerInformation ? 'ConnectDialog-Caller' : 'ConnectDialog-Child'}
          handleConfirm={handleConfirmDialog}
          handleClose={handleCloseDialog}
        />
      )}
      <ContactDetailsHome
        task={task}
        context={context}
        showActionIcons={Boolean(taskContact)}
        contactId={contactId}
        handleOpenConnectDialog={handleOpenConnectDialog}
        enableEditing={enableEditing && featureFlags.enable_contact_editing}
      />
    </NavigableContainer>
  );
};

ContactDetails.displayName = 'ContactDetails';

const connected = connector(ContactDetails);

export default connected;
