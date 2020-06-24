import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ButtonBase, IconButton } from '@material-ui/core';
import { MoreHoriz, Link as LinkIcon } from '@material-ui/icons';

import { DetailsContainer, NameContainer, DetNameText, ContactDetailsIcon } from '../../../styles/search';
import Section from './Section';
import SectionEntry from './SectionEntry';
import callTypes, { channelTypes } from '../../../states/DomainConstants';
import { isNonDataCallType } from '../../../states/ValidationRules';
import { contactType } from '../../../types';
import { formatAddress, formatDuration, formatName, mapChannel } from '../../../utils';

const MoreHorizIcon = ContactDetailsIcon(MoreHoriz);

const Details = ({ contact, handleOpenConnectDialog, handleMockedMessage }) => {
  // Object destructuring on contact
  const { overview, details, counselor, tags } = contact;
  const { dateTime, name: childName, customerNumber, callType, channel, conversationDuration } = overview;
  const child = details.childInformation;
  const caller = details.callerInformation;
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
  const formattedChannel = mapChannel(channel);
  const formattedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
  const formattedDuration = formatDuration(conversationDuration);
  const formattedChildAddress = formatAddress(
    child.location.streetAddress,
    child.location.city,
    child.location.stateOrCounty,
    child.location.postalCode,
  );

  const callerName = `${caller.name.firstName} ${caller.name.lastName}`;
  const callerOrUnknown = formatName(callerName);
  const formattedCallerAddress = formatAddress(
    caller.location.streetAddress,
    caller.location.city,
    caller.location.stateOrCounty,
    caller.location.postalCode,
  );

  const isPhoneContact =
    channel === channelTypes.voice || channel === channelTypes.sms || channel === channelTypes.whatsapp;
  const [tag1, tag2, tag3] = tags;

  const isNonDataContact = isNonDataCallType(contact.overview.callType);

  return (
    <DetailsContainer>
      <NameContainer>
        <DetNameText>{childUpperCased}</DetNameText>
        <IconButton
          onClick={handleOpenConnectDialog}
          isDisabled={isNonDataContact}
          style={{ paddingTop: 0, paddingBottom: 0 }}
        >
          <LinkIcon style={{ color: '#ffffff' }} />
        </IconButton>
        <ButtonBase style={{ padding: 0 }} onClick={handleMockedMessage}>
          <MoreHorizIcon style={{ color: '#ffffff' }} />
        </ButtonBase>
      </NameContainer>
      <Section expanded sectionTitle="General details">
        <SectionEntry description="Channel" value={formattedChannel} />
        <SectionEntry description="Phone Number" value={isPhoneContact ? customerNumber : ''} />
        <SectionEntry description="Conversation Duration" value={formattedDuration} />
        <SectionEntry description="Counselor" value={counselor} />
        <SectionEntry description="Date/Time" value={formattedDate} />
      </Section>
      {callType === callTypes.caller && (
        <Section sectionTitle="Caller information">
          <SectionEntry description="Name" value={callerOrUnknown} />
          <SectionEntry description="Relationship to Child" value={caller.relationshipToChild} />
          <SectionEntry description="Address" value={formattedCallerAddress} />
          <SectionEntry description="Phone #1" value={caller.location.phone1} />
          <SectionEntry description="Phone #2" value={caller.location.phone2} />
          <SectionEntry description="Gender" value={caller.gender} />
          <SectionEntry description="Age Range" value={caller.age} />
          <SectionEntry description="Language" value={caller.language} />
          <SectionEntry description="Nationality" value={caller.nationality} />
          <SectionEntry description="Ethnicity" value={caller.ethnicity} />
        </Section>
      )}
      {isDataCall && (
        <Section sectionTitle="Child information">
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
        <Section sectionTitle="Issue categorization">
          {Boolean(tag1) && <SectionEntry description="Category 1" value={tag1} />}
          {Boolean(tag2) && <SectionEntry description="Category 2" value={tag2} />}
          {Boolean(tag3) && <SectionEntry description="Category 3" value={tag3} />}
          {!(tag1 || tag2 || tag3) && <SectionEntry description="No category provided" value="" />}
        </Section>
      )}
      {isDataCall && (
        <Section sectionTitle="Case summary">
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
  handleOpenConnectDialog: PropTypes.func.isRequired,
  handleMockedMessage: PropTypes.func.isRequired,
};

export default Details;
