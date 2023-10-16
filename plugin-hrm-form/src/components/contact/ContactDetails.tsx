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
import { getAseloFeatureFlags } from '../../hrmConfig';
import { configurationBase, contactFormsBase, csamReportBase, namespace } from '../../states/storeNamespaces';

type OwnProps = {
  contactId: string;
  context: DetailsContext;
  handleOpenConnectDialog?: (event: any) => void;
  enableEditing?: boolean;
  showActionIcons?: boolean;
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const version = savedContact?.rawJson.definitionVersion;

  const featureFlags = getAseloFeatureFlags();
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

  const editContactSectionElement = (
    section: ContactDetailsSectionFormApi,
    formPath: 'callerInformation' | 'childInformation' | 'caseInformation',
  ) => (
    <EditContactSection context={context} contactId={contactId} tabPath={formPath}>
      <ContactDetailsSectionForm
        tabPath={formPath}
        definition={section.getFormDefinition(definitionVersion)}
        layoutDefinition={section.getLayoutDefinition(definitionVersion)}
        initialValues={section.getFormValues(definitionVersion, draftContact)[formPath]}
        display={true}
        autoFocus={true}
        updateFormActionDispatcher={dispatch => values =>
          dispatch(
            updateDraft(contactId, {
              rawJson: {
                [formPath]: values[formPath],
              },
            }),
          )}
        contactId={contactId}
      />
    </EditContactSection>
  );

  if (draftContact) {
    if (draftContact.rawJson?.categories) {
      return (
        <EditContactSection context={context} contactId={contactId} tabPath="categories">
          <IssueCategorizationSectionForm
            definition={definitionVersion.tabbedForms.IssueCategorizationTab(draftContact.helpline)}
            stateApi={forExistingContact(contactId)}
            display={true}
            autoFocus={true}
          />
        </EditContactSection>
      );
    }

    const { callerInformation, caseInformation, childInformation } = draftContact.rawJson;

    if (childInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CHILD_INFORMATION, 'childInformation');
    if (callerInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CALLER_INFORMATION, 'callerInformation');
    if (caseInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CASE_INFORMATION, 'caseInformation');
  }
  if (draftCsamReport) {
    return <CSAMReport api={existingContactCSAMApi(contactId)} />;
  }

  return (
    <ContactDetailsHome
      context={context}
      showActionIcons={showActionIcons}
      contactId={contactId}
      handleOpenConnectDialog={handleOpenConnectDialog}
      enableEditing={enableEditing && featureFlags.enable_contact_editing}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch<{ type: string } & Record<string, any>>) => ({
  updateDefinitionVersion: (version: string, definitionVersion: DefinitionVersion) =>
    dispatch(ConfigActions.updateDefinitionVersion(version, definitionVersion)),
});

const mapStateToProps = (state: RootState, { contactId }: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  savedContact: state[namespace][contactFormsBase].existingContacts[contactId]?.savedContact,
  draftContact: state[namespace][contactFormsBase].existingContacts[contactId]?.draftContact,
  draftCsamReport: state[namespace][csamReportBase].contacts[contactId],
});

ContactDetails.displayName = 'ContactDetails';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactDetails);

export default connected;
