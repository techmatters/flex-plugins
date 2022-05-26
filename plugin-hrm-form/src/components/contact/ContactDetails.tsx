// TODO: complete this type
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';

import ContactDetailsHome from './ContactDetailsHome';
import { ContactDetailsRoute, DetailsContext, navigateContactDetails } from '../../states/contacts/contactDetails';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import EditContactSection from './EditContactSection';
import { DetailsContainer } from '../../styles/search';
import { ContactDetailsSectionFormApi, contactDetailsSectionFormApi } from './contactDetailsSectionFormApi';
import ContactDetailsSectionForm from './ContactDetailsSectionForm';
import IssueCategorizationSectionForm from './IssueCategorizationSectionForm';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { getConfig } from '../../HrmFormPlugin';
import useDefinitionVersion from '../../hooks/useDefinitionVersion';

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
  route,
  contact,
  navigateForContext,
  enableEditing = true,
}) => {
  const version = contact?.details.definitionVersion;
  const { definitionVersion, error: dvError } = useDefinitionVersion(version);

  const { featureFlags } = getConfig();

  /**
   * Reset to home after we leave
   */
  React.useEffect(() => {
    return () => {
      navigateForContext(context, ContactDetailsRoute.HOME);
    };
  }, [navigateForContext, context]);

  if (!definitionVersion && !dvError)
    return (
      <DetailsContainer>
        <CircularProgress size={50} />
      </DetailsContainer>
    );

  const editContactSectionElement = (
    section: ContactDetailsSectionFormApi,
    formPath: 'callerInformation' | 'childInformation' | 'caseInformation',
  ) => (
    <EditContactSection context={context} contactId={contactId} contactDetailsSectionForm={section}>
      <ContactDetailsSectionForm
        tabPath={formPath}
        definition={section.getFormDefinition(definitionVersion)}
        layoutDefinition={section.getLayoutDefinition(definitionVersion)}
        initialValues={section.getFormValues(definitionVersion, contact)[formPath]}
        display={true}
        autoFocus={true}
        updateFormActionDispatcher={() => () => {
          /* */
        }}
      />
    </EditContactSection>
  );

  switch (route) {
    case ContactDetailsRoute.EDIT_CHILD_INFORMATION:
      return editContactSectionElement(contactDetailsSectionFormApi.CHILD_INFORMATION, 'childInformation');
    case ContactDetailsRoute.EDIT_CALLER_INFORMATION:
      return editContactSectionElement(contactDetailsSectionFormApi.CALLER_INFORMATION, 'callerInformation');
    case ContactDetailsRoute.EDIT_CATEGORIES:
      const issueSection = contactDetailsSectionFormApi.ISSUE_CATEGORIZATION;
      return (
        <EditContactSection
          context={context}
          contactId={contactId}
          contactDetailsSectionForm={contactDetailsSectionFormApi.ISSUE_CATEGORIZATION}
        >
          <IssueCategorizationSectionForm
            definition={definitionVersion.tabbedForms.IssueCategorizationTab(contact.overview.helpline)}
            initialValue={issueSection.getFormValues(definitionVersion, contact).categories}
            stateApi={forExistingContact(contactId)}
            display={true}
            autoFocus={true}
          />
        </EditContactSection>
      );
    case ContactDetailsRoute.EDIT_CASE_INFORMATION: {
      return editContactSectionElement(contactDetailsSectionFormApi.CASE_INFORMATION, 'caseInformation');
    }
    case ContactDetailsRoute.HOME:
    default:
      return (
        <ContactDetailsHome
          context={context}
          showActionIcons={showActionIcons}
          contactId={contactId}
          handleOpenConnectDialog={handleOpenConnectDialog}
          enableEditing={enableEditing && featureFlags.enable_contact_editing}
        />
      );
  }
};

const mapDispatchToProps = {
  navigateForContext: navigateContactDetails,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  route: state[namespace][contactFormsBase].contactDetails[ownProps.context].route,
  contact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.contact,
});

ContactDetails.displayName = 'ContactDetails';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactDetails);

export default connected;
