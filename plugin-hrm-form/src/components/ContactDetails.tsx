import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ButtonBase, IconButton } from '@material-ui/core';
import { MoreHoriz, Link as LinkIcon } from '@material-ui/icons';

import { DetailsContainer, NameContainer, DetNameText, ContactDetailsIcon } from '../styles/search';
import Section from './Section';
import SectionEntry from './SectionEntry';
import callTypes, { channelTypes } from '../states/DomainConstants';
import { isNonDataCallType } from '../states/ValidationRules';
import { contactType } from '../types';
import {
  formatAddress,
  formatDuration,
  formatName,
  formatCategories,
  mapChannel,
  mapChannelForInsights,
} from '../utils';
import { CallerSection, ContactDetailsSections } from './common/ContactDetails';
import { getConfig } from '../HrmFormPlugin';

const MoreHorizIcon = ContactDetailsIcon(MoreHoriz);

const Details = ({
  contact,
  detailsExpanded,
  showActionIcons,
  handleOpenConnectDialog,
  handleMockedMessage,
  handleExpandDetailsSection,
}) => {
  // Object destructuring on contact
  const { overview, details, counselor } = contact;
  const { dateTime, name: childName, customerNumber, callType, channel, conversationDuration, categories } = overview;
  const child = details.childInformation;
  const {
    callSummary,
    referredTo,
    status,
    keepConfidential,
    okForCaseWorkerToCall,
    howDidTheChildHearAboutUs,
    didYouDiscussRightsWithTheChild,
    didTheChildFeelWeSolvedTheirProblem,
    wouldTheChildRecommendUsToAFriend,
  } = details.caseInformation;

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const childOrUnknown = formatName(childName);
  const childUpperCased = childOrUnknown.toUpperCase();
  const formattedChannel =
    channel === 'default' ? mapChannelForInsights(details.contactlessTask.channel) : mapChannel(channel);
  const formattedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
  const formattedDuration = formatDuration(conversationDuration);
  const formattedChildAddress = formatAddress(
    child.location.streetAddress,
    child.location.city,
    child.location.stateOrCounty,
    child.location.postalCode,
  );

  const isPhoneContact =
    channel === channelTypes.voice || channel === channelTypes.sms || channel === channelTypes.whatsapp;
  const [category1, category2, category3] = formatCategories(categories);

  const isNonDataContact = isNonDataCallType(contact.overview.callType);

  const { strings } = getConfig();

  const {
    GENERAL_DETAILS,
    CALLER_INFORMATION,
    CHILD_INFORMATION,
    ISSUE_CATEGORIZATION,
    CONTACT_SUMMARY,
  } = ContactDetailsSections;

  return (
    <DetailsContainer data-testid="ContactDetails-Container">
      <NameContainer>
        <DetNameText>{childUpperCased}</DetNameText>
        {showActionIcons && (
          <>
            <IconButton
              onClick={handleOpenConnectDialog}
              disabled={isNonDataContact}
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <LinkIcon style={{ color: '#ffffff' }} />
            </IconButton>
            <ButtonBase style={{ padding: 0 }} onClick={handleMockedMessage}>
              <MoreHorizIcon style={{ color: '#ffffff' }} />
            </ButtonBase>
          </>
        )}
      </NameContainer>
      <Section
        sectionTitle={strings['ContactDetails-GeneralDetails']}
        expanded={detailsExpanded[GENERAL_DETAILS]}
        handleExpandClick={() => handleExpandDetailsSection(GENERAL_DETAILS)}
      >
        <SectionEntry description="Channel" value={formattedChannel} />
        <SectionEntry description="Phone Number" value={isPhoneContact ? customerNumber : ''} />
        <SectionEntry description="Conversation Duration" value={formattedDuration} />
        <SectionEntry description="Counselor" value={counselor} />
        <SectionEntry description="Date/Time" value={formattedDate} />
      </Section>
      {callType === callTypes.caller && (
        <CallerSection
          expanded={detailsExpanded[CALLER_INFORMATION]}
          handleExpandClick={() => handleExpandDetailsSection(CALLER_INFORMATION)}
          sectionTitleTemplate="TabbedForms-AddCallerInfoTab"
          values={details.callerInformation}
        />
      )}
      {isDataCall && (
        <Section
          sectionTitle={strings['TabbedForms-AddChildInfoTab']}
          expanded={detailsExpanded[CHILD_INFORMATION]}
          handleExpandClick={() => handleExpandDetailsSection(CHILD_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
        >
          <SectionEntry description="Name" value={childOrUnknown} />
          <SectionEntry description="Address" value={formattedChildAddress} />
          <SectionEntry description="Phone #1" value={child.location.phone1} />
          <SectionEntry description="Phone #2" value={child.location.phone2} />
          <SectionEntry description="Gender" value={child.gender} />
          <SectionEntry description="Age Range" value={child.age} />
          <SectionEntry description="Language" value={child.language} />
          <SectionEntry description="Nationality" value={child.nationality} />
          <SectionEntry description="Ethnicity" value={child.ethnicity} />
          <SectionEntry description="School Name" value={child.school.name} />
          <SectionEntry description="Grade Level" value={child.school.gradeLevel} />
          <SectionEntry description="Refugee?" value={child.refugee} />
          <SectionEntry description="Disabled/Special Needs?" value={child.disabledOrSpecialNeeds} />
          <SectionEntry description="HIV Positive?" value={child.hiv} />
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={strings['TabbedForms-CategoriesTab']}
          expanded={detailsExpanded[ISSUE_CATEGORIZATION]}
          handleExpandClick={() => handleExpandDetailsSection(ISSUE_CATEGORIZATION)}
        >
          {Boolean(category1) && <SectionEntry description="Category 1" value={category1} />}
          {Boolean(category2) && <SectionEntry description="Category 2" value={category2} />}
          {Boolean(category3) && <SectionEntry description="Category 3" value={category3} />}
          {!(category1 || category2 || category3) && <SectionEntry description="No category provided" value="" />}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={strings['TabbedForms-AddCaseInfoTab']}
          expanded={detailsExpanded[CONTACT_SUMMARY]}
          handleExpandClick={() => handleExpandDetailsSection(CONTACT_SUMMARY)}
        >
          <SectionEntry description="Call Summary" value={callSummary} />
          <SectionEntry description="Status" value={status} />
          <SectionEntry description="Referred To" value={referredTo} />
          <SectionEntry description="Keep Confidential?" value={keepConfidential} />
          <SectionEntry description="OK for the case worker to call?" value={okForCaseWorkerToCall} />
          <SectionEntry description="How did the child hear about us?" value={howDidTheChildHearAboutUs} />
          <SectionEntry description="Did you discuss rights with the child?" value={didYouDiscussRightsWithTheChild} />
          <SectionEntry
            description="Did the child feel we solved their problem?"
            value={didTheChildFeelWeSolvedTheirProblem}
          />
          <SectionEntry
            description="Would the child recommend us to a friend?"
            value={wouldTheChildRecommendUsToAFriend}
          />
        </Section>
      )}
    </DetailsContainer>
  );
};

Details.displayName = 'Details';

Details.propTypes = {
  contact: contactType.isRequired,
  detailsExpanded: PropTypes.objectOf(PropTypes.bool).isRequired,
  handleOpenConnectDialog: PropTypes.func,
  handleMockedMessage: PropTypes.func,
  handleExpandDetailsSection: PropTypes.func.isRequired,
  showActionIcons: PropTypes.bool,
};
Details.defaultProps = {
  handleOpenConnectDialog: () => null,
  handleMockedMessage: () => null,
  showActionIcons: false,
};

export default Details;
