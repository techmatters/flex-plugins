// TODO: complete this type
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';

import ContactDetailsHome from './ContactDetailsHome';
import { ContactDetailsRoute, DetailsContext, navigateContactDetails } from '../../states/contacts/contactDetails';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import EditContactSection from './EditContactSection';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { DetailsContainer } from '../../styles/search';
import * as ConfigActions from '../../states/configuration/actions';
import { ContactDetailsSectionForm, contactDetailsSectionForm, ContactFormValues } from './contactDetailsSectionForms';
import TabbedFormTab from '../tabbedForms/TabbedFormTab';
import IssueCategorizationTab from '../tabbedForms/IssueCategorizationTab';
import { TaskEntry } from '../../states/contacts/reducer';

type OwnProps = {
  contactId: string;
  context: DetailsContext;
  handleOpenConnectDialog?: (event: any) => void;
  showActionIcons?: boolean;
};

type Props = OwnProps & ConnectedProps<typeof connector>;

const ContactDetails: React.FC<Props> = ({
  context,
  contactId,
  handleOpenConnectDialog,
  showActionIcons,
  route,
  definitionVersions,
  updateDefinitionVersion,
  contact,
  navigateForContext,
}) => {
  const version = contact?.details.definitionVersion;

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
  }, [definitionVersions, updateDefinitionVersion, version, contact]);

  /**
   * Reset to home after we leave
   */
  React.useEffect(() => {
    return () => {
      navigateForContext(context, ContactDetailsRoute.HOME);
    };
  }, [navigateForContext, context]);
  const definitionVersion = definitionVersions[version];

  if (!definitionVersion)
    return (
      <DetailsContainer>
        <CircularProgress size={50} />
      </DetailsContainer>
    );

  const editContactSectionElement = (
    section: ContactDetailsSectionForm,
    formPath: 'callerInformation' | 'childInformation' | 'caseInformation',
  ) => (
    <EditContactSection context={context} contactId={contactId} contactDetailsSectionForm={section}>
      <TabbedFormTab
        entityIdentifier={contactId}
        tabPath={formPath}
        definition={section.getFormDefinition(definitionVersion)}
        layoutDefinition={section.getLayoutDefinition(definitionVersion)}
        initialValues={section.getFormValues(definitionVersion, contact)[formPath]}
        display={true}
        autoFocus={true}
      />
    </EditContactSection>
  );

  switch (route) {
    case ContactDetailsRoute.EDIT_CHILD_INFORMATION:
      return editContactSectionElement(contactDetailsSectionForm.CHILD_INFORMATION, 'childInformation');
    case ContactDetailsRoute.EDIT_CALLER_INFORMATION:
      return editContactSectionElement(contactDetailsSectionForm.CALLER_INFORMATION, 'callerInformation');
    case ContactDetailsRoute.EDIT_CATEGORIES:
      const issueSection = contactDetailsSectionForm.ISSUE_CATEGORIZATION;
      return (
        <EditContactSection
          context={context}
          contactId={contactId}
          contactDetailsSectionForm={contactDetailsSectionForm.ISSUE_CATEGORIZATION}
        >
          <IssueCategorizationTab
            definition={definitionVersion.tabbedForms.IssueCategorizationTab(contact.overview.helpline)}
            initialValue={issueSection.getFormValues(definitionVersion, contact).categories}
            contactId={contactId}
            display={true}
            autoFocus={true}
          />
        </EditContactSection>
      );
    case ContactDetailsRoute.EDIT_CASE_INFORMATION: {
      return editContactSectionElement(contactDetailsSectionForm.CASE_INFORMATION, 'caseInformation');
    }
    case ContactDetailsRoute.HOME:
    default:
      return (
        <ContactDetailsHome
          context={context}
          showActionIcons={showActionIcons}
          contactId={contactId}
          handleOpenConnectDialog={handleOpenConnectDialog}
        />
      );
  }
};

const mapDispatchToProps = {
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
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
