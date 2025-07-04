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
import React, { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { Actions, Icon, Insights, Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { callTypes, DataCallTypes } from 'hrm-types';
import { isNonSaveable } from 'hrm-form-definitions';
import { Edit } from '@material-ui/icons';
import { Grid } from '@material-ui/core';

import { useProfile } from '../../states/profile/hooks';
import { Box, Flex, TertiaryButton } from '../../styles';
import {
  Contact,
  ContactRawJson,
  CustomITask,
  isS3StoredRecording,
  isS3StoredTranscript,
  isTwilioStoredMedia,
  RouterTask,
  StandaloneITask,
} from '../../types/types';
import { ContactAddedFont, ContactDetailsIcon } from '../search/styles';
import ContactDetailsSection from './ContactDetailsSection';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import { channelTypes, isChatChannel, isVoiceChannel } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/validationRules';
import { formatCategories, formatDuration } from '../../utils/formatters';
import { mapChannelForInsights } from '../../utils/mappers';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../common/ContactDetails';
import { RootState } from '../../states';
import { DetailsContext, toggleDetailSectionExpanded } from '../../states/contacts/contactDetails';
import { getInitializedCan, PermissionActions } from '../../permissions';
import { RecordingSection, TranscriptSection } from './MediaSection';
import { newCSAMReportActionForContact } from '../../states/csam-report/actions';
import { getAseloFeatureFlags, getTemplateStrings } from '../../hrmConfig';
import { changeRoute, newOpenModalAction } from '../../states/routing/actions';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { AppRoutes, isRouteWithContext } from '../../states/routing/types';
import ContactAddedToCaseBanner from '../caseMergingBanners/ContactAddedToCaseBanner';
import ContactRemovedFromCaseBanner from '../caseMergingBanners/ContactRemovedFromCaseBanner';
import { selectCaseMergingBanners } from '../../states/case/caseBanners';
import { isSmsChannelType } from '../../utils/groupedChannels';
import getCanEditContact from '../../permissions/canEditContact';
import AddCaseButton from '../tabbedForms/AddCaseButton';
import openNewCase from '../case/openNewCase';
import { formatCsamReport, formatResourceReferral } from './helpers';
import ContactInProgressBanners from './ContactInProgressBanners';
import selectContactStateByContactId from '../../states/contacts/selectContactStateByContactId';
import { selectDefinitionVersionForContact } from '../../states/configuration/selectDefinitions';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';
import selectContactDetailsByContext from '../../states/contacts/selectContactDetailsByContext';

// TODO: complete this type
type OwnProps = {
  contactId: string;
  task: CustomITask | StandaloneITask;
  context: DetailsContext;
  showActionIcons?: boolean;
  handleOpenConnectDialog?: (event: any, callType: DataCallTypes) => void;
  enableEditing: boolean;
};

type Props = OwnProps;

/* eslint-disable complexity */
// eslint-disable-next-line sonarjs/cognitive-complexity
const ContactDetailsHome: React.FC<Props> = function ({
  contactId,
  showActionIcons = false,
  handleOpenConnectDialog,
  context,
  enableEditing,
  task,
}) {
  // Redux selectors
  const savedContact = useSelector((state: RootState) => selectContactStateByContactId(state, contactId)?.savedContact);
  const isProfileRoute = useSelector((state: RootState) => {
    const currentRoute = selectCurrentTopmostRouteForTask(state, task.taskSid);
    return isRouteWithContext(currentRoute) && currentRoute?.context === 'profile';
  });
  const definitionVersion = useSelector((state: RootState) => selectDefinitionVersionForContact(state, savedContact));
  const counselorsHash = useSelector((state: RootState) => selectCounselorsHash(state));
  const showRemovedFromCaseBanner = useSelector(
    (state: RootState) => selectCaseMergingBanners(state, contactId).showRemovedFromCaseBanner,
  );
  const detailsExpanded = useSelector(
    (state: RootState) => selectContactDetailsByContext(state, context).detailsExpanded,
  );
  const canViewTwilioTranscript = useSelector((state: RootState) =>
    (state.flex.worker.attributes.roles as string[]).some(
      role => role.toLowerCase().startsWith('wfo') && role !== 'wfo.quality_process_manager',
    ),
  );

  // Redux actions
  const dispatch = useDispatch();
  const navigate = (
    form: keyof Pick<ContactRawJson, 'caseInformation' | 'callerInformation' | 'categories' | 'childInformation'>,
  ) => dispatch(changeRoute({ route: 'contact', subroute: 'edit', id: contactId, form }, task.taskSid));
  const createDraftCsamReport = () => dispatch(newCSAMReportActionForContact(contactId));
  const openProfileModal = id => {
    dispatch(newOpenModalAction({ route: 'profile', profileId: id, subroute: 'details' }, task.taskSid));
  };
  const openModal = (route: AppRoutes) => dispatch(newOpenModalAction(route, task.taskSid));
  const createNewCase = async (task: RouterTask, savedContact: Contact, contact: Contact) =>
    openNewCase(task, savedContact, contact, dispatch);

  const featureFlags = getAseloFeatureFlags();
  const strings = getTemplateStrings();

  // Permission to edit is based the counselor who created the contact - identified by Twilio worker ID
  const can = useMemo(() => {
    return action => getInitializedCan()(action, savedContact);
  }, [savedContact]);

  const canEditContact = useMemo(() => getCanEditContact(savedContact), [savedContact]);

  useEffect(
    () => () => {
      Actions.invokeAction(Insights.Player.Action.INSIGHTS_PLAYER_HIDE);
    },
    [],
  );

  const { canView } = useProfile({ profileId: savedContact?.profileId });

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

  const isDraft = !savedContact.finalizedAt;

  const { callType, categories, hangUpBy } = rawJson;

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

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const formattedChannel =
    channel === 'default' ? mapChannelForInsights(rawJson.contactlessTask.channel) : mapChannelForInsights(channel);
  const addedDate = new Date(timeOfContact);

  const formattedDate = `${format(addedDate, 'MMM dd, yyyy')}`;
  const formattedTime = `${format(addedDate, 'h:mm aaaaa')}m`;

  const formattedDuration = formatDuration(conversationDuration);

  const isPhoneContact =
    channel === channelTypes.voice || channel === channelTypes.whatsapp || isSmsChannelType(channel);

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
  const toggleSection = (section: ContactDetailsSectionsType) =>
    dispatch(toggleDetailSectionExpanded(context, section));

  const EditIcon = ContactDetailsIcon(Edit);

  const externalReportButton = () => (
    <TertiaryButton type="button" onClick={() => createDraftCsamReport()}>
      <EditIcon style={{ fontSize: '14px', padding: '-1px 6px 0 6px', marginRight: '6px' }} />
      <Grid item xs={12}>
        <Template code="ContactDetails-GeneralDetails-externalReport" />
      </Grid>
    </TertiaryButton>
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

  const maskIdentifiers = !can(PermissionActions.VIEW_IDENTIFIERS);

  const openSearchModal = () => {
    // We need a way to pass the contact ID to the CasePreview component
    openModal({ contextContactId: savedContact.id, route: 'search', subroute: 'form', action: 'select-case' });
  };

  const handleOpenNewCase = async () => {
    await createNewCase(task, savedContact, savedContact);
  };

  const profileLink = featureFlags.enable_client_profiles && !isProfileRoute && savedContact.profileId && canView && (
    <TertiaryButton type="button" onClick={() => openProfileModal(savedContact.profileId)}>
      <Icon icon="DefaultAvatar" />
      <Template code="Profile-ViewClient" />
    </TertiaryButton>
  );

  const addedToCaseBanner = () => <ContactAddedToCaseBanner taskId={task.taskSid} contactId={savedContact.id} />;
  const showAddcaseButton = !isDraft && !showRemovedFromCaseBanner;

  const renderCaseBanners = () => {
    return (
      <>
        {caseId
          ? addedToCaseBanner()
          : showAddcaseButton && (
              <Box display="flex" justifyContent="flex-end" marginBottom="4px">
                <AddCaseButton
                  position="top"
                  handleNewCaseType={handleOpenNewCase}
                  handleExistingCaseType={openSearchModal}
                />
              </Box>
            )}

        {showRemovedFromCaseBanner && (
          <ContactRemovedFromCaseBanner
            taskId={task.taskSid}
            contactId={savedContact.id}
            showUndoButton={showRemovedFromCaseBanner}
          />
        )}
      </>
    );
  };

  return (
    <Box data-testid="ContactDetails-Container">
      {auditMessage(timeOfContact, createdBy, 'ContactDetails-ActionHeaderAdded')}
      {auditMessage(updatedAt, updatedBy, 'ContactDetails-ActionHeaderUpdated')}
      <ContactInProgressBanners contactId={contactId} />
      {renderCaseBanners()}

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
        {hangUpBy && (
          <SectionEntry descriptionKey="ContactDetails-GeneralDetails-HangUpBy">
            <SectionEntryValue value={`ContactDetails-GeneralDetails-HangUpBy/${hangUpBy}`} />
          </SectionEntry>
        )}
      </ContactDetailsSection>
      {callType === callTypes.caller && (
        <ContactDetailsSection
          sectionTitle={<Template code="TabbedForms-AddCallerInfoTab" />}
          expanded={detailsExpanded[CALLER_INFORMATION]}
          handleExpandClick={() => toggleSection(CALLER_INFORMATION)}
          showEditButton={enableEditing && canEditContact()}
          handleEditClick={() => navigate('callerInformation')}
          buttonDataTestid="ContactDetails-Section-CallerInformation"
          handleOpenConnectDialog={handleOpenConnectDialog}
          showActionIcons={showActionIcons}
          callType={callTypes.caller}
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
          showEditButton={enableEditing && canEditContact()}
          handleEditClick={() => navigate('childInformation')}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
          handleOpenConnectDialog={handleOpenConnectDialog}
          showActionIcons={showActionIcons}
          callType={callTypes.child}
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
          showEditButton={enableEditing && canEditContact()}
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
          showEditButton={enableEditing && canEditContact()}
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
          {csamReportEnabled && canEditContact() && (
            <SectionEntry descriptionKey="ContactDetails-GeneralDetails-ExternalReportsFiled">
              {externalReportButton()}
              {csamReports?.map(formatCsamReport)}
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

export default ContactDetailsHome;
