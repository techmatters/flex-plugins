// TODO: complete this type
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';

import ContactDetailsHome from './ContactDetailsHome';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import EditContactSection from './EditContactSection';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { DetailsContainer } from '../../styles/search';
import * as ConfigActions from '../../states/configuration/actions';
import { ContactDetailsSectionFormApi, contactDetailsSectionFormApi } from './contactDetailsSectionFormApi';
import ContactDetailsSectionForm from './ContactDetailsSectionForm';
import IssueCategorizationSectionForm from './IssueCategorizationSectionForm';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { getConfig } from '../../HrmFormPlugin';
import { updateDraft } from '../../states/contacts/existingContacts';
import { transformContactFormValues } from '../../services/ContactService';

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
  updateContactDraft,
}) => {
  const version = savedContact?.details.definitionVersion;

  const { featureFlags } = getConfig();
  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  React.useEffect(() => {
    const fetchDefinitionVersions = async (v: string) => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions(version);
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
    <EditContactSection context={context} contactId={contactId} contactDetailsSectionForm={section} tabPath={formPath}>
      <ContactDetailsSectionForm
        tabPath={formPath}
        definition={section.getFormDefinition(definitionVersion)}
        layoutDefinition={section.getLayoutDefinition(definitionVersion)}
        initialValues={section.getFormValues(definitionVersion, draftContact)[formPath]}
        display={true}
        autoFocus={true}
        updateFormActionDispatcher={dispatch => values =>
          dispatch(
            updateContactDraft(contactId, {
              details: {
                [formPath]: transformContactFormValues(values[formPath], section.getFormDefinition(definitionVersion)),
              },
            }),
          )}
      />
    </EditContactSection>
  );

  if (draftContact) {
    if (draftContact.overview?.categories) {
      const issueSection = contactDetailsSectionFormApi.ISSUE_CATEGORIZATION;
      return (
        <EditContactSection
          context={context}
          contactId={contactId}
          contactDetailsSectionForm={contactDetailsSectionFormApi.ISSUE_CATEGORIZATION}
          tabPath="categories"
        >
          <IssueCategorizationSectionForm
            definition={definitionVersion.tabbedForms.IssueCategorizationTab(draftContact.overview.helpline)}
            initialValue={issueSection.getFormValues(definitionVersion, draftContact).categories}
            stateApi={forExistingContact(contactId)}
            display={true}
            autoFocus={true}
          />
        </EditContactSection>
      );
    }
    const { callerInformation, caseInformation, childInformation } = draftContact.details;
    if (childInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CHILD_INFORMATION, 'childInformation');
    if (callerInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CALLER_INFORMATION, 'callerInformation');
    if (caseInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CASE_INFORMATION, 'caseInformation');
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

const mapDispatchToProps = {
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
  updateContactDraft: updateDraft,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  savedContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.savedContact,
  draftContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.draftContact,
});

ContactDetails.displayName = 'ContactDetails';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactDetails);

export default connected;
