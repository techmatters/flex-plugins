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
import { Actions, Icon, Insights, Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { callTypes, isNonSaveable } from 'hrm-form-definitions';
import { Edit } from '@material-ui/icons';
import { Grid } from '@material-ui/core';

import { Box, Flex, Row } from '../../styles/HrmStyles';
import {
  ContactRawJson,
  CSAMReportEntry,
  CustomITask,
  isS3StoredRecording,
  isS3StoredTranscript,
  isTwilioStoredMedia,
  StandaloneITask,
} from '../../types/types';
import { ContactAddedFont, ContactDetailsIcon, SectionActionButton, SectionValueText } from '../../styles/search';
import ContactDetailsSection from './ContactDetailsSection';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import { channelTypes, isChatChannel, isVoiceChannel } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/validationRules';
import { formatCategories, formatDuration, mapChannelForInsights } from '../../utils';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../common/ContactDetails';
import { RootState } from '../../states';
import { DetailsContext, toggleDetailSectionExpanded } from '../../states/contacts/contactDetails';
import { getPermissionsForContact, getPermissionsForViewingIdentifiers, PermissionActions } from '../../permissions';
import { ContactDetailsRoute, createDraft } from '../../states/contacts/existingContacts';
import { RecordingSection, TranscriptSection } from './MediaSection';
import { newCSAMReportActionForContact } from '../../states/csam-report/actions';
import type { ResourceReferral } from '../../states/contacts/resourceReferral';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';
import { configurationBase, contactFormsBase, namespace } from '../../states/storeNamespaces';
import { changeRoute, newOpenModalAction } from '../../states/routing/actions';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { isRouteWithContext } from '../../states/routing/types';
import ContactAddedToCaseBanner from '../caseMergingBanners/ContactAddedToCaseBanner';
import ContactRemovedFromCaseBanner from '../caseMergingBanners/ContactRemovedFromCaseBanner';
import { selectCaseMergingBanners } from '../../states/case/caseBanners';

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
  task: CustomITask | StandaloneITask;
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
  navigate,
  openProfileModal,
  isProfileRoute,
  enableEditing,
  canViewTwilioTranscript,
  createDraftCsamReport,
  task,
  showRemovedFromCaseBanner,
}) {
  const version = savedContact?.rawJson.definitionVersion;

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

  const {
    twilioWorkerId,
    number,
    timeOfContact,
    csamReports,
    referrals,
    conversationDuration,
    channel,
    createdBy,
    updatedAt,
    updatedBy,
    rawJson,
    caseId,
  } = savedContact;

  const { callType, categories } = rawJson;

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
  const { can } = getPermissionsForContact(twilioWorkerId);

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const formattedChannel =
    channel === 'default' ? mapChannelForInsights(rawJson.contactlessTask.channel) : mapChannelForInsights(channel);
  const addedDate = new Date(timeOfContact);

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
    RECORDING,
  } = ContactDetailsSections;
  const addedBy = counselorsHash[createdBy];
  const counselorName = counselorsHash[twilioWorkerId];
  const toggleSection = (section: ContactDetailsSectionsType) => toggleSectionExpandedForContext(section);

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
    const { storeTypeSpecificData } = savedContact.conversationMedia.find(isTwilioStoredMedia);
    await Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_PLAY, {
      taskSid: storeTypeSpecificData.reservationSid,
    });
  };

  const twilioStoredTranscript =
    featureFlags.enable_twilio_transcripts &&
    canViewTwilioTranscript &&
    savedContact.conversationMedia?.find(isTwilioStoredMedia);
  const externalStoredTranscript =
    featureFlags.enable_external_transcripts &&
    can(PermissionActions.VIEW_EXTERNAL_TRANSCRIPT) &&
    savedContact.conversationMedia?.find(isS3StoredTranscript);

  const showTranscriptSection = Boolean(
    isChatChannel(channel) &&
      savedContact.conversationMedia?.length &&
      (twilioStoredTranscript || externalStoredTranscript),
  );

  const twilioStoredRecording =
    featureFlags.enable_voice_recordings && savedContact.conversationMedia?.find(isTwilioStoredMedia);
  const externalStoredRecording = savedContact.conversationMedia?.find(isS3StoredRecording);
  const showRecordingSection = Boolean(
    isVoiceChannel(channel) &&
      savedContact.conversationMedia?.length &&
      can(PermissionActions.VIEW_RECORDING) &&
      (twilioStoredRecording || externalStoredRecording),
  );

  const csamReportEnabled = featureFlags.enable_csam_report && featureFlags.enable_csam_clc_report;

  const { canView } = getPermissionsForViewingIdentifiers();
  const maskIdentifiers = !canView(PermissionActions.VIEW_IDENTIFIERS);

  const profileLink = featureFlags.enable_client_profiles && !isProfileRoute && savedContact.profileId && (
    <SectionActionButton padding="0" type="button" onClick={() => openProfileModal(savedContact.profileId)}>
      <Icon icon="DefaultAvatar" />
      View Client
    </SectionActionButton>
  );

  return (
    <Box data-testid="ContactDetails-Container">
      {auditMessage(timeOfContact, createdBy, 'ContactDetails-ActionHeaderAdded')}
      {auditMessage(updatedAt, updatedBy, 'ContactDetails-ActionHeaderUpdated')}

      {caseId && <ContactAddedToCaseBanner taskId={task.taskSid} contactId={savedContact.id} caseId={caseId} />}
      {showRemovedFromCaseBanner && (
        <ContactRemovedFromCaseBanner
          taskId={task.taskSid}
          savedContact={savedContact}
          showRemovedFromCaseBanner={showRemovedFromCaseBanner}
        />
      )}

      <ContactDetailsSection
        sectionTitle={<Template code="ContactDetails-GeneralDetails" />}
        expanded={detailsExpanded[GENERAL_DETAILS]}
        handleExpandClick={() => toggleSection(GENERAL_DETAILS)}
        buttonDataTestid={`ContactDetails-Section-${GENERAL_DETAILS}`}
        contactId={contactId}
        extraActionButton={profileLink}
      >
        <SectionEntry descriptionKey="ContactDetails-GeneralDetails-Channel">
          <SectionEntryValue value={formattedChannel} />
        </SectionEntry>
        {isPhoneContact && (
          <SectionEntry descriptionKey="ContactDetails-GeneralDetails-PhoneNumber">
            <SectionEntryValue value={maskIdentifiers ? strings.MaskIdentifiers : number} />
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
        {addedBy && addedBy !== twilioWorkerId && (
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
          handleEditClick={() => navigate('callerInformation')}
          buttonDataTestid="ContactDetails-Section-CallerInformation"
          handleOpenConnectDialog={handleOpenConnectDialog}
          showActionIcons={showActionIcons}
          callType="caller"
        >
          {definitionVersion.tabbedForms.CallerInformationTab.filter(e => !isNonSaveable(e)).map(e => (
            <SectionEntry key={`CallerInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue value={savedContact.rawJson.callerInformation[e.name]} definition={e} />
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
          handleEditClick={() => navigate('childInformation')}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
          handleOpenConnectDialog={handleOpenConnectDialog}
          showActionIcons={showActionIcons}
          callType="child"
        >
          {definitionVersion.tabbedForms.ChildInformationTab.filter(e => !isNonSaveable(e)).map(e => (
            <SectionEntry key={`ChildInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue value={savedContact.rawJson.childInformation[e.name]} definition={e} />
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
          handleEditClick={() => navigate('categories')}
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
            navigate('caseInformation');
          }}
        >
          {definitionVersion.tabbedForms.CaseInformationTab.filter(e => !isNonSaveable(e)).map(e => (
            <SectionEntry key={`CaseInformation-${e.label}`} descriptionKey={e.label}>
              <SectionEntryValue
                value={savedContact.rawJson.caseInformation[e.name] as boolean | string}
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

      {showRecordingSection && (
        <ContactDetailsSection
          sectionTitle={<Template code="ContactDetails-Recording" />}
          expanded={detailsExpanded[RECORDING]}
          handleExpandClick={() => toggleSection(RECORDING)}
          buttonDataTestid="ContactDetails-Section-Recording"
          showEditButton={false}
        >
          <Flex justifyContent="center" flexDirection="row" paddingTop="20px">
            <RecordingSection
              contactId={contactId}
              externalStoredRecording={externalStoredRecording}
              loadConversationIntoOverlay={loadConversationIntoOverlay}
            />{' '}
          </Flex>
        </ContactDetailsSection>
      )}
    </Box>
  );
};

ContactDetailsHome.displayName = 'Details';

ContactDetailsHome.defaultProps = {
  handleOpenConnectDialog: () => null,
  showActionIcons: false,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const currentRoute = getCurrentTopmostRouteForTask(state[namespace].routing, ownProps.task.taskSid);
  const { showRemovedFromCaseBanner } = selectCaseMergingBanners(state, ownProps.contactId);
  return {
    definitionVersions: state[namespace][configurationBase].definitionVersions,
    counselorsHash: state[namespace][configurationBase].counselors.hash,
    savedContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.savedContact,
    draftContact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.draftContact,
    detailsExpanded: state[namespace][contactFormsBase].contactDetails[ownProps.context].detailsExpanded,
    canViewTwilioTranscript: (state.flex.worker.attributes.roles as string[]).some(
      role => role.toLowerCase().startsWith('wfo') && role !== 'wfo.quality_process_manager',
    ),
    isProfileRoute: isRouteWithContext(currentRoute) && currentRoute?.context === 'profile',
    showRemovedFromCaseBanner,
  };
};

const mapDispatchToProps = (dispatch, { contactId, context, task }: OwnProps) => ({
  toggleSectionExpandedForContext: (section: ContactDetailsSectionsType) =>
    dispatch(toggleDetailSectionExpanded(context, section)),
  createContactDraft: (draftRoute: ContactDetailsRoute) => dispatch(createDraft(contactId, draftRoute)),
  createDraftCsamReport: () => dispatch(newCSAMReportActionForContact(contactId)),
  navigate: (
    form: keyof Pick<ContactRawJson, 'caseInformation' | 'callerInformation' | 'categories' | 'childInformation'>,
  ) => dispatch(changeRoute({ route: 'contact', subroute: 'edit', id: contactId, form }, task.taskSid)),
  openProfileModal: id => {
    dispatch(newOpenModalAction({ route: 'profile', id, subroute: 'details' }, task.taskSid));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ContactDetailsHome);
