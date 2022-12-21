// TODO: complete this type
import React, { useState } from 'react';
import { connect, ConnectedProps, useDispatch } from 'react-redux';
import { CircularProgress } from '@material-ui/core';

import { CustomITask } from '../../types/types';
import ContactDetailsHome from './ContactDetailsHome';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { configurationBase, contactFormsBase, namespace, RootState, routingBase } from '../../states';
import EditContactSection from './EditContactSection';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { DetailsContainer } from '../../styles/search';
import * as ConfigActions from '../../states/configuration/actions';
import { ContactDetailsSectionFormApi, contactDetailsSectionFormApi } from './contactDetailsSectionFormApi';
import ContactDetailsSectionForm from './ContactDetailsSectionForm';
import IssueCategorizationSectionForm from './IssueCategorizationSectionForm';
import { forExistingContact } from '../../states/contacts/issueCategorizationStateApi';
import { getConfig } from '../../HrmFormPlugin';
// eslint-disable-next-line import/namespace
import { updateDraft } from '../../states/contacts/existingContacts';
import { setExternalReport } from '../../states/contacts/actions';
import {
  transformContactFormValues,
  externalReportDefinition,
  externalReportLayoutDefinition,
  transformExternalReportValues,
} from '../../services/ContactService';
import * as routingActions from '../../states/routing/actions';
import ExternalReport from './ExternalReport';

type OwnProps = {
  contactId: string;
  context: DetailsContext;
  handleOpenConnectDialog?: (event: any) => void;
  enableEditing?: boolean;
  showActionIcons?: boolean;
  taskSid?: CustomITask['taskSid'];
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
  addExternalReport,
  setExternalReport,
  enableEditing = true,
  updateContactDraft,
  taskSid,
  // eslint-disable-next-line sonarjs/cognitive-complexity
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

  const addExternalReportSectionElement = (formPath: 'externalReport') => (
    <EditContactSection
      context={context}
      contactId={contactId}
      tabPath="externalReport"
      externalReport={addExternalReport}
    >
      <ContactDetailsSectionForm
        tabPath="externalReport"
        definition={externalReportDefinition}
        layoutDefinition={externalReportLayoutDefinition.layout}
        initialValues={externalReportDefinition}
        display={true}
        autoFocus={true}
        updateFormActionDispatcher={dispatch => values =>
          dispatch(
            updateContactDraft(contactId, {
              details: {
                [formPath]: transformExternalReportValues(values.externalReport, externalReportDefinition),
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

    const { callerInformation, caseInformation, childInformation, externalReport, csamReport } = draftContact.details;

    if (childInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CHILD_INFORMATION, 'childInformation');
    if (callerInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CALLER_INFORMATION, 'callerInformation');
    if (caseInformation)
      return editContactSectionElement(contactDetailsSectionFormApi.CASE_INFORMATION, 'caseInformation');

    if (externalReport) {
      setExternalReport(externalReport.reportType as string, taskSid);
      return addExternalReportSectionElement('externalReport');
    }

    if (csamReport && addExternalReport !== null) {
      return <ExternalReport contactId={contactId} taskSid={taskSid} externalReport={addExternalReport} />;
    }
    return addExternalReportSectionElement('externalReport');
  }

  console.log('contactId is here', addExternalReport);

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
  setExternalReport,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  savedContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.savedContact,
  draftContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.draftContact,
  addExternalReport: state[namespace][contactFormsBase].externalReport,
});

ContactDetails.displayName = 'ContactDetails';

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(ContactDetails);

export default connected;
