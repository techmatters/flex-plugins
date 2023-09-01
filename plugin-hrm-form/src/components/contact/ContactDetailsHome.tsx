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

/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Actions, Insights, Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { callTypes, isNonSaveable } from 'hrm-form-definitions';
import { Edit } from '@material-ui/icons';
import { Grid } from '@material-ui/core';

import { Flex, Box, Row } from '../../styles/HrmStyles';
import {
  CSAMReportEntry,
  isS3StoredRecording,
  isS3StoredTranscript,
  isTwilioStoredMedia,
  SearchAPIContact,
} from '../../types/types';
import {
  DetailsContainer,
  NameText,
  ContactAddedFont,
  SectionTitleContainer,
  SectionActionButton,
  SectionValueText,
  ContactDetailsIcon,
} from '../../styles/search';
import ContactDetailsSection from './ContactDetailsSection';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import { channelTypes, isChatChannel, isVoiceChannel } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/validationRules';
import { formatCategories, formatDuration, mapChannelForInsights } from '../../utils';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../common/ContactDetails';
import { configurationBase, contactFormsBase, namespace, RootState } from '../../states';
import { DetailsContext, toggleDetailSectionExpanded } from '../../states/contacts/contactDetails';
import { getPermissionsForContact, getPermissionsForViewingIdentifiers, PermissionActions } from '../../permissions';
import { createDraft, ContactDetailsRoute } from '../../states/contacts/existingContacts';
import { TranscriptSection, RecordingSection } from './MediaSection';
import { newCSAMReportActionForContact } from '../../states/csam-report/actions';
import { contactLabelFromSearchContact } from '../../states/contacts/contactIdentifier';
import type { ResourceReferral } from '../../states/contacts/resourceReferral';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';

const formatResourceReferral = (referral: ResourceReferral) => {
  return (
    <Box marginBottom="5px">
      <SectionValueText>
        {referral.resourceName}
        <br />
        <Row>ID #{referral.resourceId}</Row>
      </SectionValueText>
    </Box>
  );
};

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
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

/* eslint-disable complexity */
// eslint-disable-next-line sonarjs/cognitive-complexity
const ContactDetailsHome: React.FC<Props> = function ({
  contactId,
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
  createDraftCsamReport,
}) {
  const version = savedContact?.details.definitionVersion;

  const definitionVersion = definitionVersions[version];

  const featureFlags = getAseloFeatureFlags();
  const strings = getTemplateStrings();

  useEffect(
    () => () => {
      Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_HIDE);
    },
    [],
  );

  if (!savedContact || !definitionVersion) return null;

  // Object destructuring on contact
  const { overview, details, csamReports, referrals } = savedContact as SearchAPIContact;
  const {
    counselor,
    dateTime,
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
  const childOrUnknown = contactLabelFromSearchContact(definitionVersion, savedContact, {
    substituteForId: false,
  });
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
  const toggleSection = (section: ContactDetailsSectionsType) => toggleSectionExpandedForContext(section);
  const navigate = (route: ContactDetailsRoute) => createContactDraft(route);

  const EditIcon = ContactDetailsIcon(Edit);

  const externalReportButton = () => (
    <SectionActionButton padding="0" type="button" onClick={() => createDraftCsamReport()}>
      <EditIcon style={{ fontSize: '14px', padding: '-1px 6px 0 6px', marginRight: '6px' }} />
      <Grid item xs={12}>
        <Template code="ContactDetails-GeneralDetails-externalReport" />
      </Grid>
    </SectionActionButton>
  );

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
  const externalStoredRecording = savedContact.details.conversationMedia?.find(isS3StoredRecording);

  const csamReportEnabled = featureFlags.enable_csam_report && featureFlags.enable_csam_clc_report;

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  const displayContactId = savedContact.contactId?.toString().startsWith('__unsaved')
    ? 'ContactDetails-UnsavedContact'
    : `#${savedContact.contactId}`;

  return (
    <DetailsContainer data-testid="ContactDetails-Container">
      <NameText>
        <Template code={displayContactId} /> {childOrUnknown}
      </NameText>

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
        {isPhoneContact && (
          <SectionEntry descriptionKey="ContactDetails-GeneralDetails-PhoneNumber">
            <SectionEntryValue value={maskIdentifiers ? strings.MaskIdentifiers : customerNumber} />
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
          {definitionVersion.tabbedForms.CallerInformationTab.filter(e => !isNonSaveable(e)).map(e => (
            <SectionEntry key={`CallerInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue value={savedContact.details.callerInformation[e.name]} definition={e} />
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
          {definitionVersion.tabbedForms.ChildInformationTab.filter(e => !isNonSaveable(e)).map(e => (
            <SectionEntry key={`ChildInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue value={savedContact.details.childInformation[e.name]} definition={e} />
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
          {definitionVersion.tabbedForms.CaseInformationTab.filter(e => !isNonSaveable(e)).map(e => (
            <SectionEntry key={`CaseInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue
                value={savedContact.details.caseInformation[e.name] as boolean | string}
                definition={e}
              />
            </SectionEntry>
          ))}
          {referrals && Boolean(referrals.length) && (
            <SectionEntry descriptionKey="ContactDetails-GeneralDetails-ResourcesReferrals">
              {referrals.map(formatResourceReferral)}
            </SectionEntry>
          )}
          {csamReportEnabled && can(PermissionActions.EDIT_CONTACT) && (
            <SectionEntry descriptionKey="ContactDetails-GeneralDetails-ExternalReportsFiled">
              {externalReportButton()}
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
      <RecordingSection externalStoredRecording={externalStoredRecording} />
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
});

const mapDispatchToProps = (dispatch, { contactId, context }: OwnProps) => ({
  toggleSectionExpandedForContext: (section: ContactDetailsSectionsType) =>
    dispatch(toggleDetailSectionExpanded(context, section)),
  createContactDraft: (draftRoute: ContactDetailsRoute) => dispatch(createDraft(contactId, draftRoute)),
  createDraftCsamReport: () => dispatch(newCSAMReportActionForContact(contactId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContactDetailsHome);
