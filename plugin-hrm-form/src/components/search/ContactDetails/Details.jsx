import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Button } from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';

import { DetailsContainer, NameContainer, DetNameText, ContactDetailsIcon } from '../../../Styles/search';
import Section from './Section';
import { contactType } from '../../../types';

const MoreHorizIcon = ContactDetailsIcon(MoreHoriz);

/**
 * @param {string} name
 */
export const formatName = name => (name.trim() === '' ? 'Unknown' : name);

/**
 * @param {string} street
 * @param {string} city
 * @param {string} state
 * @param {string} postalCode
 */
export const formatAddress = (street, city, state, postalCode) => {
  const commaSeparated = [street, city, state].filter(s => s.trim()).join(', ');
  const withPostalCode = [commaSeparated, postalCode].filter(s => s.trim()).join(' ');
  return withPostalCode;
};

/**
 * @param {string} s
 */
const checkForDataContact = s => {
  switch (s) {
    case 'Someone calling about a child':
      return true;
    case 'Child calling about self':
      return true;
    default:
      return false;
  }
};

/**
 * Helper for conditionally passing an entry to a Section in a typesafe way
 * @param {boolean} pred
 * @param {{ description: string, value: string | number | boolean}} entry
 * @returns Returns the entry if predicate is satisfied, or null otherwise
 */
const maybeEntry = (pred, entry) => (pred ? entry : null);

const Details = ({ contact, handleClickCallSummary }) => {
  const { overview, details, counselor, tags } = contact;
  const { dateTime, name, customerNumber, callType, channel, conversationDuration } = overview;
  const { gender, age, language, nationality, ethnicity, location, refugee } = details.childInformation;
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
  const {
    name: callerNameObj,
    relationshipToChild: callerRelationship,
    gender: callerGender,
    age: callerAge,
    language: callerLanguage,
    nationality: callerNationality,
    ethnicity: callerEthnicity,
    location: callerLocation,
  } = details.callerInformation;

  const isDataContact = checkForDataContact(callType);
  const nameOrUnknown = formatName(name);
  const nameUpperCase = nameOrUnknown.toUpperCase();
  const formattedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
  const { streetAddress, city, stateOrCounty, postalCode, phone1, phone2 } = location;
  const formattedAddress = formatAddress(streetAddress, city, stateOrCounty, postalCode);

  const callerName = `${callerNameObj.firstName} ${callerNameObj.lastName}`;
  const callerOrUnknown = formatName(callerName);
  const {
    streetAddress: callerStreet,
    city: callerCity,
    stateOrCounty: callerState,
    postalCode: callerPC,
    phone1: callerPhone1,
    phone2: callerPhone2,
  } = callerLocation;
  const formattedCallerAddress = formatAddress(callerStreet, callerCity, callerState, callerPC);
  const [tag1, tag2, tag3] = tags;

  return (
    <DetailsContainer>
      <NameContainer>
        <DetNameText>{nameUpperCase}</DetNameText>
        <Button
          size="small"
          style={{ padding: 0 }}
          onClick={() => /* TODO: this must be implemented */ console.log(contact)}
        >
          <MoreHorizIcon style={{ color: '#ffffff' }} />
        </Button>
      </NameContainer>
      <Section
        expanded
        sectionTitle="General details"
        entries={[
          { description: 'Channel', value: channel },
          maybeEntry(Boolean(customerNumber), { description: 'Phone Number', value: customerNumber }),
          { description: 'Conversation Duration', value: conversationDuration },
          { description: 'Counselor', value: counselor },
          { description: 'Date/Time', value: formattedDate },
        ]}
      />
      {callType === 'Someone calling about a child' && (
        <Section
          sectionTitle="Caller information"
          entries={[
            { description: 'Name', value: callerOrUnknown },
            { description: 'Relationship to Child', value: callerRelationship },
            { description: 'Address', value: formattedCallerAddress },
            maybeEntry(Boolean(callerPhone1), { description: 'Phone', value: callerPhone1 }),
            maybeEntry(Boolean(callerPhone2), { description: 'Phone', value: callerPhone2 }),
            { description: 'Gender', value: callerGender },
            { description: 'Age Range', value: callerAge },
            { description: 'Language', value: callerLanguage },
            { description: 'Nationality', value: callerNationality },
            { description: 'Ethnicity', value: callerEthnicity },
          ]}
        />
      )}
      {isDataContact && (
        <Section
          sectionTitle="Child information"
          entries={[
            { description: 'Name', value: nameOrUnknown },
            { description: 'Address', value: formattedAddress },
            maybeEntry(Boolean(phone1), { description: 'Phone', value: phone1 }),
            maybeEntry(Boolean(phone2), { description: 'Phone', value: phone2 }),
            { description: 'Gender', value: gender },
            { description: 'Age Range', value: age },
            { description: 'Language', value: language },
            { description: 'Nationality', value: nationality },
            { description: 'Ethnicity', value: ethnicity },
            { description: 'Is Refugee?', value: refugee },
          ]}
        />
      )}
      {isDataContact && (
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
      {isDataContact && (
        <Section
          sectionTitle="Case summary"
          entries={[
            { description: 'Call Summary', value: callSummary },
            { description: 'Status', value: status },
            { description: 'Referred by?', value: referredTo },
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
  handleClickCallSummary: PropTypes.func.isRequired,
};

export default Details;
