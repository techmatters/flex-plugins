/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Actions, Insights, Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';

import {
  DetailsContainer,
  NameText,
  ContactAddedFont,
  SectionTitleContainer,
  SectionActionButton,
} from '../../styles/search';
import ContactDetailsSection from './ContactDetailsSection';
import SectionEntry from '../SectionEntry';
import { channelTypes } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formatCategories, formatDuration, formatName, mapChannelForInsights } from '../../utils';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../common/ContactDetails';
import { unNestInformation } from '../../services/ContactService';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import { DetailsContext, toggleDetailSectionExpanded } from '../../states/contacts/contactDetails';
import { getPermissionsForContact, PermissionActions } from '../../permissions';
import { createDraft, ContactDetailsRoute } from '../../states/contacts/existingContacts';
import { getConfig } from '../../HrmFormPlugin';

// TODO: complete this type
type OwnProps = {
  contactId: string;
  context: DetailsContext;
  showActionIcons?: boolean;
  handleOpenConnectDialog?: (event: any) => void;
  enableEditing: boolean;
};
// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

/* eslint-disable complexity */
// eslint-disable-next-line sonarjs/cognitive-complexity
const ContactDetailsHome: React.FC<Props> = function ({
  context,
  detailsExpanded,
  showActionIcons = false,
  handleOpenConnectDialog,
  definitionVersions,
  counselorsHash,
  savedContact,
  toggleSectionExpandedForContext,
  createContactDraft,
  enableEditing,
  canViewTranscript,
}) {
  const version = savedContact?.details.definitionVersion;

  const definitionVersion = definitionVersions[version];

  const { featureFlags } = getConfig();

  useEffect(
    () => () => {
      Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_HIDE);
    },
    [],
  );

  if (!savedContact || !definitionVersion) return null;

  // Object destructuring on contact
  const { overview, details, csamReports } = savedContact;
  const {
    counselor,
    dateTime,
    name: childName,
    customerNumber,
    callType,
    channel,
    conversationDuration,
    categories,
    createdBy,
  } = overview;
  // Permission to edit is based the counselor who created the contact - identified by Twilio worker ID
  const createdByTwilioWorkerId = savedContact?.overview.counselor;
  const { can } = getPermissionsForContact(createdByTwilioWorkerId);

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const childOrUnknown = formatName(childName);
  const formattedChannel =
    channel === 'default'
      ? mapChannelForInsights(details.contactlessTask.channel.toString())
      : mapChannelForInsights(channel);
  const formattedDateStandard = `${format(new Date(dateTime), 'M/dd/yyyy')}`;
  const formattedTimeStandard = `${format(new Date(dateTime), 'h:mm a')}`;

  const formattedDate = `${format(new Date(dateTime), 'MMM dd, yyyy')}`;
  const formattedTime = `${format(new Date(dateTime), 'h:mm aaaaa')}m`;

  const formattedDuration = formatDuration(conversationDuration);

  const isPhoneContact =
    channel === channelTypes.voice || channel === channelTypes.sms || channel === channelTypes.whatsapp;
  const formattedCategories = formatCategories(categories);

  const {
    GENERAL_DETAILS,
    CALLER_INFORMATION,
    CHILD_INFORMATION,
    ISSUE_CATEGORIZATION,
    CONTACT_SUMMARY,
  } = ContactDetailsSections;
  const addedBy = counselorsHash[createdBy];
  const counselorName = counselorsHash[counselor];

  const toggleSection = (section: ContactDetailsSectionsType) => toggleSectionExpandedForContext(context, section);
  const navigate = (route: ContactDetailsRoute) => createContactDraft(savedContact.contactId, route);

  const loadConversationIntoOverlay = async () => {
    await Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_PLAY, {
      taskSid: savedContact.details.conversationMedia[0],
    });
  };

  const csamReportsAttached =
    csamReports &&
    csamReports
      .map(r => `CSAM on ${format(new Date(r.createdAt), 'yyyy MM dd h:mm aaaaa')}m\n#${r.csamReportId}`)
      .join('\n\n');

  return (
    <DetailsContainer data-testid="ContactDetails-Container">
      <NameText>{childOrUnknown}</NameText>
      <ContactAddedFont style={{ marginRight: 20 }} data-testid="ContactDetails-ActionHeaderAdded">
        <Template
          code="ContactDetails-ActionHeaderAdded"
          date={formattedDateStandard}
          time={formattedTimeStandard}
          counsellor={addedBy}
        />
      </ContactAddedFont>
      <ContactDetailsSection
        sectionTitle={<Template code="ContactDetails-GeneralDetails" />}
        expanded={detailsExpanded[GENERAL_DETAILS]}
        handleExpandClick={() => toggleSection(GENERAL_DETAILS)}
        buttonDataTestid={`ContactDetails-Section-${GENERAL_DETAILS}`}
      >
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-Channel" />}
          value={formattedChannel}
        />
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-PhoneNumber" />}
          value={isPhoneContact ? customerNumber : ''}
        />
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-ConversationDuration" />}
          value={formattedDuration}
        />
        <SectionEntry description={<Template code="ContactDetails-GeneralDetails-Counselor" />} value={counselorName} />
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-DateTime" />}
          value={`${formattedDate} / ${formattedTime}`}
        />
        {addedBy && addedBy !== counselor && (
          <SectionEntry description={<Template code="ContactDetails-GeneralDetails-AddedBy" />} value={addedBy} />
        )}
      </ContactDetailsSection>
      {callType === callTypes.caller && (
        <ContactDetailsSection
          sectionTitle={<Template code="TabbedForms-AddCallerInfoTab" />}
          expanded={detailsExpanded[CALLER_INFORMATION]}
          handleExpandClick={() => toggleSection(CALLER_INFORMATION)}
          showEditButton={enableEditing && can(PermissionActions.EDIT_CONTACT)}
          handleEditClick={() => navigate(ContactDetailsRoute.EDIT_CALLER_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-CallerInformation"
        >
          {definitionVersion.tabbedForms.CallerInformationTab.map(e => (
            <SectionEntry
              key={`CallerInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={unNestInformation(e, savedContact.details.callerInformation)}
              definition={e}
            />
          ))}
        </ContactDetailsSection>
      )}
      {isDataCall && (
        <ContactDetailsSection
          sectionTitle={<Template code="TabbedForms-AddChildInfoTab" />}
          expanded={detailsExpanded[CHILD_INFORMATION]}
          handleExpandClick={() => toggleSection(CHILD_INFORMATION)}
          showEditButton={enableEditing && can(PermissionActions.EDIT_CONTACT)}
          handleEditClick={() => navigate(ContactDetailsRoute.EDIT_CHILD_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
          handleOpenConnectDialog={handleOpenConnectDialog}
          showActionIcons={showActionIcons}
        >
          {definitionVersion.tabbedForms.ChildInformationTab.map(e => (
            <SectionEntry
              key={`ChildInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={unNestInformation(e, savedContact.details.childInformation)}
              definition={e}
            />
          ))}
        </ContactDetailsSection>
      )}
      {isDataCall && (
        <ContactDetailsSection
          sectionTitle={<Template code="TabbedForms-CategoriesTab" />}
          expanded={detailsExpanded[ISSUE_CATEGORIZATION]}
          handleExpandClick={() => toggleSection(ISSUE_CATEGORIZATION)}
          buttonDataTestid="ContactDetails-Section-IssueCategorization"
          showEditButton={enableEditing && can(PermissionActions.EDIT_CONTACT)}
          handleEditClick={() => navigate(ContactDetailsRoute.EDIT_CATEGORIES)}
        >
          {formattedCategories.length ? (
            formattedCategories.map((c, index) => (
              <SectionEntry
                key={`Category ${index + 1}`}
                description={
                  <span style={{ display: 'inline-block' }}>
                    <Template code="Category" /> {index + 1}
                  </span>
                }
                value={c}
              />
            ))
          ) : (
            <SectionEntry description="No category provided" value="" />
          )}
        </ContactDetailsSection>
      )}
      {isDataCall && (
        <ContactDetailsSection
          sectionTitle={<Template code="TabbedForms-AddCaseInfoTab" />}
          expanded={detailsExpanded[CONTACT_SUMMARY]}
          handleExpandClick={() => toggleSection(CONTACT_SUMMARY)}
          buttonDataTestid={`ContactDetails-Section-${CONTACT_SUMMARY}`}
          showEditButton={enableEditing && can(PermissionActions.EDIT_CONTACT)}
          handleEditClick={() => navigate(ContactDetailsRoute.EDIT_CASE_INFORMATION)}
        >
          {definitionVersion.tabbedForms.CaseInformationTab.map(e => (
            <SectionEntry
              key={`CaseInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={savedContact.details.caseInformation[e.name] as boolean | string}
              definition={e}
            />
          ))}
          {csamReportsAttached && (
            <SectionEntry
              key="CaseInformation-AttachedCSAMReports"
              description={<Template code="CSAMReportForm-ReportsSubmitted" />}
              value={csamReportsAttached}
            />
          )}
        </ContactDetailsSection>
      )}
      {((featureFlags.enable_voice_recordings && channel === channelTypes.voice) ||
        (featureFlags.enable_transcripts && channel !== channelTypes.voice)) &&
        canViewTranscript &&
        savedContact.details.conversationMedia &&
        savedContact.details.conversationMedia.length &&
        typeof savedContact.overview.conversationDuration === 'number' && (
          <SectionTitleContainer style={{ justifyContent: 'right', paddingTop: '10px', paddingBottom: '10px' }}>
            <SectionActionButton type="button" onClick={loadConversationIntoOverlay}>
              {channel === channelTypes.voice ? (
                <Template code="ContactDetails-LoadRecording-Button" />
              ) : (
                <Template code="ContactDetails-LoadTranscript-Button" />
              )}
            </SectionActionButton>
          </SectionTitleContainer>
        )}
    </DetailsContainer>
  );
};

ContactDetailsHome.displayName = 'Details';

ContactDetailsHome.defaultProps = {
  handleOpenConnectDialog: () => null,
  showActionIcons: false,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  savedContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.savedContact,
  draftContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.draftContact,
  detailsExpanded: state[namespace][contactFormsBase].contactDetails[ownProps.context].detailsExpanded,
  canViewTranscript: (state.flex.worker.attributes.roles as string[]).some(
    role => role.toLowerCase().startsWith('wfo') && role !== 'wfo.',
  ),
});

const mapDispatchToProps = {
  toggleSectionExpandedForContext: toggleDetailSectionExpanded,
  createContactDraft: createDraft,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactDetailsHome);
