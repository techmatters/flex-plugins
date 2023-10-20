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

// TODO: complete this type
import React, { Dispatch } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { DefinitionVersion } from 'hrm-form-definitions';

import ContactDetailsHome from './ContactDetailsHome';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { RootState } from '../../states';
import EditContactSection from './EditContactSection';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { DetailsContainer } from '../../styles/search';
import * as ConfigActions from '../../states/configuration/actions';
import { ContactDetailsSectionFormApi, contactDetailsSectionFormApi } from './contactDetailsSectionFormApi';
import ContactDetailsSectionForm from './ContactDetailsSectionForm';
import IssueCategorizationSectionForm from './IssueCategorizationSectionForm';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { updateDraft } from '../../states/contacts/existingContacts';
import CSAMReport from '../CSAMReport/CSAMReport';
import { existingContactCSAMApi } from '../CSAMReport/csamReportApi';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';
import { namespace } from '../../states/storeNamespaces';
import { ContactRawJson, CustomITask, StandaloneITask } from '../../types/types';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import NavigableContainer from '../NavigableContainer';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import { newCloseModalAction } from '../../states/routing/actions';
import { getUnsavedContact } from '../../states/contacts/getUnsavedContact';

type OwnProps = {
  contactId: string;
  context: DetailsContext;
  handleOpenConnectDialog?: (event: any) => void;
  enableEditing?: boolean;
  showActionIcons?: boolean;
  task: CustomITask | StandaloneITask;
  onClose?: () => void;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetails: React.FC<Props> = ({
  context,
  contactId,
  handleOpenConnectDialog,
  showActionIcons,
  definitionVersions,
  updateDefinitionVersion,
  savedContact,
  draftContact,
  enableEditing = true,
  draftCsamReport,
  updateDraftForm,
  task,
  onClose = () => undefined,
  closeModal,
  currentRoute,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
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

  if (!definitionVersion)
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

  const editContactSectionElement = (
    formPath: 'callerInformation' | 'childInformation' | 'caseInformation' | 'categories',
  ) => {
    const unsavedContact = getUnsavedContact(savedContact, draftContact);
    return (
      <NavigableContainer
        titleCode={editContactSectionTitle(formPath)}
        task={task}
        onCloseModal={() => {
          closeModal();
          onClose();
        }}
      >
        <EditContactSection context={context} contactId={contactId} tabPath={formPath} task={task}>
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
              autoFocus={true}
              updateForm={values =>
                updateDraftForm({
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
    <NavigableContainer titleCode={childOrUnknown} task={task}>
      <ContactDetailsHome
        task={task}
        context={context}
        showActionIcons={showActionIcons}
        contactId={contactId}
        handleOpenConnectDialog={handleOpenConnectDialog}
        enableEditing={enableEditing && featureFlags.enable_contact_editing}
      />
    </NavigableContainer>
  );
};

const mapDispatchToProps = (
  dispatch: Dispatch<{ type: string } & Record<string, any>>,
  { contactId, task }: OwnProps,
) => ({
  updateDefinitionVersion: (version: string, definitionVersion: DefinitionVersion) =>
    dispatch(ConfigActions.updateDefinitionVersion(version, definitionVersion)),
  updateDraftForm: (form: Partial<ContactRawJson>) => dispatch(updateDraft(contactId, { rawJson: form })),
  closeModal: () => dispatch(newCloseModalAction(task.taskSid)),
});

const mapStateToProps = (
  { [namespace]: { configuration, activeContacts, 'csam-report': csamReport, routing } }: RootState,
  { contactId, task }: OwnProps,
) => ({
  definitionVersions: configuration.definitionVersions,
  savedContact: activeContacts.existingContacts[contactId]?.savedContact,
  draftContact: activeContacts.existingContacts[contactId]?.draftContact,
  draftCsamReport: csamReport.contacts[contactId],
  currentRoute: getCurrentTopmostRouteForTask(routing, task.taskSid),
});

ContactDetails.displayName = 'ContactDetails';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactDetails);

export default connected;
