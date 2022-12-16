/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Actions, Insights, Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';

import { Flex, Box } from '../../styles/HrmStyles';
import { CSAMReportEntry, isS3StoredTranscript, isTwilioStoredMedia, SearchAPIContact } from '../../types/types';
import {
  DetailsContainer,
  NameText,
  ContactAddedFont,
  SectionTitleContainer,
  SectionActionButton,
  SectionValueText,
} from '../../styles/search';
import ContactDetailsSection from './ContactDetailsSection';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import { channelTypes, isChatChannel, isVoiceChannel } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formatCategories, formatDuration, formatName, mapChannelForInsights } from '../../utils';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../common/ContactDetails';
import { unNestInformation } from '../../services/ContactService';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import { DetailsContext, toggleDetailSectionExpanded } from '../../states/contacts/contactDetails';
import { getPermissionsForContact, getPermissionsForViewingIdentifiers, PermissionActions } from '../../permissions';
import { createDraft, ContactDetailsRoute } from '../../states/contacts/existingContacts';
import { getConfig } from '../../HrmFormPlugin';
import TranscriptSection from './TranscriptSection';

const formatCsamReport = (report: CSAMReportEntry) => {
  const template =
    report.reportType === 'counsellor-generated' ? (
      <Template code="CSAMReportForm-Counsellor-Attachment" />
    ) : (
      <Template code="CSAMReportForm-Self-Attachment" />
    );

  const date = `${format(new Date(report.createdAt), 'yyyy MM dd h:mm aaaaa')}m`;

  return (
    <Box marginBottom="5px">
      <SectionValueText>
        {template}
        <br />
        {date}
        <br />
        {`#${report.csamReportId}`}
      </SectionValueText>
    </Box>
  );
};

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
  contactId,
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
  canViewTwilioTranscript,
}) {
  const version = savedContact?.details.definitionVersion;

  const definitionVersion = definitionVersions[version];

  const { featureFlags, strings } = getConfig();

  useEffect(
    () => () => {
      Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_HIDE);
    },
    [],
  );

  if (!savedContact || !definitionVersion) return null;

  // Object destructuring on contact
  const { overview, details, csamReports } = savedContact as SearchAPIContact;
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
    updatedAt,
    updatedBy,
  } = overview;

  const auditMessage = (timestampText: string, workerSid: string, templateKey: string) => {
    if (timestampText && workerSid) {
      const timestamp = new Date(timestampText);
      const formattedDateStandard = `${format(timestamp, 'M/dd/yyyy')}`;
      const formattedTimeStandard = `${format(timestamp, 'h:mm a')}`;
      const counselorName = counselorsHash[workerSid];
      return (
        <ContactAddedFont style={{ marginRight: 20 }} data-testid={templateKey}>
          <Template
            code={templateKey}
            date={formattedDateStandard}
            time={formattedTimeStandard}
            counsellor={counselorName}
          />
        </ContactAddedFont>
      );
    }
    return null;
  };

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
  const addedDate = new Date(dateTime);

  const formattedDate = `${format(addedDate, 'MMM dd, yyyy')}`;
  const formattedTime = `${format(addedDate, 'h:mm aaaaa')}m`;

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
    TRANSCRIPT,
  } = ContactDetailsSections;
  const addedBy = counselorsHash[createdBy];
  const counselorName = counselorsHash[counselor];
  const toggleSection = (section: ContactDetailsSectionsType) => toggleSectionExpandedForContext(context, section);
  const navigate = (route: ContactDetailsRoute) => createContactDraft(savedContact.contactId, route);

  const loadConversationIntoOverlay = async () => {
    const twilioStoredMedia = savedContact.details.conversationMedia.find(isTwilioStoredMedia);
    await Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_PLAY, {
      taskSid: twilioStoredMedia.reservationSid,
    });
  };

  const recordingAvailable = Boolean(
    featureFlags.enable_voice_recordings &&
      isVoiceChannel(channel) &&
      canViewTwilioTranscript &&
      savedContact.details.conversationMedia?.length,
    // && typeof savedContact.overview.conversationDuration === 'number',
  );

  const twilioStoredTranscript =
    featureFlags.enable_twilio_transcripts &&
    canViewTwilioTranscript &&
    savedContact.details.conversationMedia?.find(isTwilioStoredMedia);
  const externalStoredTranscript =
    featureFlags.enable_external_transcripts &&
    can(PermissionActions.VIEW_EXTERNAL_TRANSCRIPT) &&
    savedContact.details.conversationMedia?.find(isS3StoredTranscript);
  const showTranscriptSection = Boolean(
    isChatChannel(channel) &&
      savedContact.details.conversationMedia?.length &&
      (twilioStoredTranscript || externalStoredTranscript),
  );
  const csamReportEnabled = featureFlags.enable_csam_report && featureFlags.enable_csam_clc_report;

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  return (
    <DetailsContainer data-testid="ContactDetails-Container">
      <NameText>{childOrUnknown}</NameText>

      {auditMessage(dateTime, createdBy, 'ContactDetails-ActionHeaderAdded')}

      {auditMessage(updatedAt, updatedBy, 'ContactDetails-ActionHeaderUpdated')}

      <ContactDetailsSection
        sectionTitle={<Template code="ContactDetails-GeneralDetails" />}
        expanded={detailsExpanded[GENERAL_DETAILS]}
        handleExpandClick={() => toggleSection(GENERAL_DETAILS)}
        buttonDataTestid={`ContactDetails-Section-${GENERAL_DETAILS}`}
      >
        <SectionEntry descriptionKey="ContactDetails-GeneralDetails-Channel">
          <SectionEntryValue value={formattedChannel} />
        </SectionEntry>
        {maskIdentifiers ? (
          <SectionEntry descriptionKey="ContactDetails-GeneralDetails-PhoneNumber">
            <SectionEntryValue value={strings.MaskIdentifiers} />
          </SectionEntry>
        ) : (
          <SectionEntry descriptionKey="ContactDetails-GeneralDetails-PhoneNumber">
            <SectionEntryValue value={isPhoneContact ? customerNumber : ''} />
          </SectionEntry>
        )}
        <SectionEntry descriptionKey="ContactDetails-GeneralDetails-ConversationDuration">
          <SectionEntryValue value={formattedDuration} />
        </SectionEntry>
        <SectionEntry descriptionKey="ContactDetails-GeneralDetails-Counselor">
          <SectionEntryValue value={counselorName} />
        </SectionEntry>
        <SectionEntry descriptionKey="ContactDetails-GeneralDetails-DateTime">
          <SectionEntryValue value={`${formattedDate} / ${formattedTime}`} />
        </SectionEntry>
        {addedBy && addedBy !== counselor && (
          <SectionEntry descriptionKey="ContactDetails-GeneralDetails-AddedBy">
            <SectionEntryValue value={addedBy} />
          </SectionEntry>
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
          handleOpenConnectDialog={handleOpenConnectDialog}
          showActionIcons={showActionIcons}
          callType="caller"
        >
          {definitionVersion.tabbedForms.CallerInformationTab.map(e => (
            <SectionEntry key={`CallerInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue value={unNestInformation(e, savedContact.details.callerInformation)} definition={e} />
            </SectionEntry>
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
          callType="child"
        >
          {definitionVersion.tabbedForms.ChildInformationTab.map(e => (
            <SectionEntry key={`ChildInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue value={unNestInformation(e, savedContact.details.childInformation)} definition={e} />
            </SectionEntry>
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
                descriptionKey="Category"
                descriptionStyle={{ display: 'inline-block' }}
                descrptionDetail={`${index + 1}`}
              >
                <SectionEntryValue value={c} />
              </SectionEntry>
            ))
          ) : (
            <SectionEntry descriptionKey="ContactDetails-NoCategoryProvided">
              <SectionEntryValue value="" />
            </SectionEntry>
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
          handleEditClick={() => {
            navigate(ContactDetailsRoute.EDIT_CASE_INFORMATION);
          }}
        >
          {definitionVersion.tabbedForms.CaseInformationTab.map(e => (
            <SectionEntry key={`CaseInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue
                value={savedContact.details.caseInformation[e.name] as boolean | string}
                definition={e}
              />
            </SectionEntry>
          ))}
          {csamReportEnabled && (
            <SectionEntry descriptionKey="ContactDetails-GeneralDetails-ExternalReportsFiled">
              <SectionEntryValue
                handleEditClick={() => navigate(ContactDetailsRoute.ADD_EXTERNAL_REPORT)}
                csamReportEnabled={csamReportEnabled}
              />
            </SectionEntry>
          )}
          {csamReports && csamReports.length > 0 && (
            <SectionEntry key="CaseInformation-AttachedCSAMReports" descriptionKey="CSAMReportForm-ReportsSubmitted">
              {csamReports.map(formatCsamReport)}
            </SectionEntry>
          )}
        </ContactDetailsSection>
      )}
      {recordingAvailable && (
        <SectionTitleContainer style={{ justifyContent: 'right', paddingTop: '10px', paddingBottom: '10px' }}>
          <SectionActionButton type="button" onClick={loadConversationIntoOverlay}>
            <Template code="ContactDetails-LoadRecording-Button" />
          </SectionActionButton>
        </SectionTitleContainer>
      )}
      {showTranscriptSection && (
        <ContactDetailsSection
          sectionTitle={<Template code="ContactDetails-Transcript" />}
          expanded={detailsExpanded[TRANSCRIPT]}
          handleExpandClick={() => toggleSection(TRANSCRIPT)}
          buttonDataTestid="ContactDetails-Section-Transcript"
          showEditButton={false}
        >
          <Flex justifyContent="center" flexDirection="row" paddingTop="20px">
            <TranscriptSection
              contactId={contactId}
              twilioStoredTranscript={twilioStoredTranscript}
              externalStoredTranscript={externalStoredTranscript}
              loadConversationIntoOverlay={loadConversationIntoOverlay}
            />
          </Flex>
        </ContactDetailsSection>
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
  canViewTwilioTranscript: (state.flex.worker.attributes.roles as string[]).some(
    role => role.toLowerCase().startsWith('wfo') && role !== 'wfo.quality_process_manager',
  ),
  externalReport: state[namespace][contactFormsBase].externalReport,
});

const mapDispatchToProps = {
  toggleSectionExpandedForContext: toggleDetailSectionExpanded,
  createContactDraft: createDraft,
};

export default connect(mapStateToProps, mapDispatchToProps)(ContactDetailsHome);
