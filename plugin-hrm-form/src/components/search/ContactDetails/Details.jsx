import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ButtonBase } from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';

import { DetailsContainer, NameContainer, DetNameText, ContactDetailsIcon } from '../../../Styles/search';
import Section from './Section';
import callTypes, { channelTypes } from '../../../states/DomainConstants';
import { isNonDataCallType } from '../../../states/ValidationRules';
import { contactType } from '../../../types';
import { formatAddress, formatDuration, formatName, mapChannel } from '../../../utils';

const MoreHorizIcon = ContactDetailsIcon(MoreHoriz);

/**
 * Helper for conditionally passing an entry to a Section in a typesafe way
 * @param {boolean} pred
 * @param {{ description: string, value: string | number | boolean}} entry
 * @returns Returns the entry if predicate is satisfied, or null otherwise
 */
const maybeEntry = (pred, entry) => (pred ? entry : null);

const Details = ({ contact, handleMockedMessage }) => {
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

  return (
    <DetailsContainer>
      <NameContainer>
        <DetNameText>{childUpperCased}</DetNameText>
        <ButtonBase style={{ padding: 0 }} onClick={handleMockedMessage}>
          <MoreHorizIcon style={{ color: '#ffffff' }} />
        </ButtonBase>
      </NameContainer>
      <Section
        expanded
        sectionTitle="General details"
        entries={[
          { description: 'Channel', value: formattedChannel },
          { description: 'Phone Number', value: isPhoneContact ? customerNumber : '' },
          { description: 'Conversation Duration', value: formattedDuration },
          { description: 'Counselor', value: counselor },
          { description: 'Date/Time', value: formattedDate },
        ]}
      />
      {callType === callTypes.caller && (
        <Section
          sectionTitle="Caller information"
          entries={[
            { description: 'Name', value: callerOrUnknown },
            { description: 'Relationship to Child', value: caller.relationshipToChild },
            { description: 'Address', value: formattedCallerAddress },
            { description: 'Phone #1', value: caller.location.phone1 },
            { description: 'Phone #2', value: caller.location.phone2 },
            { description: 'Gender', value: caller.gender },
            { description: 'Age Range', value: caller.age },
            { description: 'Language', value: caller.language },
            { description: 'Nationality', value: caller.nationality },
            { description: 'Ethnicity', value: caller.ethnicity },
          ]}
        />
      )}
      {isDataCall && (
        <Section
          sectionTitle="Child information"
          entries={[
            { description: 'Name', value: childOrUnknown },
            { description: 'Address', value: formattedChildAddress },
            { description: 'Phone #1', value: child.location.phone1 },
            { description: 'Phone #2', value: child.location.phone2 },
            { description: 'Gender', value: child.gender },
            { description: 'Age Range', value: child.age },
            { description: 'Language', value: child.language },
            { description: 'Nationality', value: child.nationality },
            { description: 'Ethnicity', value: child.ethnicity },
            { description: 'School Name', value: child.school.name },
            { description: 'Grade Level', value: child.school.gradeLevel },
            { description: 'Refugee?', value: child.refugee },
            { description: 'Disabled/Special Needs?', value: child.disabledOrSpecialNeeds },
            { description: 'HIV Positive?', value: child.hiv },
          ]}
        />
      )}
      {isDataCall && (
        <Section
          sectionTitle="Issue categorization"
          entries={[
            maybeEntry(Boolean(tag1), { description: 'Category 1', value: tag1 }),
            maybeEntry(Boolean(tag2), { description: 'Category 2', value: tag2 }),
            maybeEntry(Boolean(tag3), { description: 'Category 3', value: tag3 }),
            maybeEntry(!(tag1 || tag2 || tag3), { description: 'No category provided', value: '' }),
          ]}
        />
      )}
      {isDataCall && (
        <Section
          sectionTitle="Case summary"
          entries={[
            { description: 'Call Summary', value: callSummary },
            { description: 'Status', value: status },
            { description: 'Referred To', value: referredTo },
            { description: 'Keep Confidential?', value: keepConfidential },
            { description: 'OK for the case worker to call?', value: okForCaseWorkerToCall },
            { description: 'How did the child hear about us?', value: howDidTheChildHearAboutUs },
            { description: 'Did you discuss right with the child?', value: didYouDiscussRightsWithTheChild },
            { description: 'Did the child feel we solved their problem?', value: didTheChildFeelWeSolvedTheirProblem },
            { description: 'Would the child recommend us to a friend?', value: wouldTheChildRecommendUsToAFriend },
          ]}
        />
      )}
    </DetailsContainer>
  );
};

Details.displayName = 'Details';

Details.propTypes = {
  contact: contactType.isRequired,
  handleMockedMessage: PropTypes.func.isRequired,
};

export default Details;
