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
 * @param {string} s
 * @returns {string} if s is not empty, appends it with a comma and a space
 */
const withComma = s => (s.trim() ? `, ${s}` : '');

/**
 * Helper for conditional passing an entry to a Section in a typesafe way
 * @param {boolean} pred
 * @param {{ description: string, value: string | number | boolean}} entry
 * @returns Returns the entry if predicate is satisfied, or null otherwise
 */
const maybeEntry = (pred, entry) => (pred ? entry : null);

const Details = ({ contact, handleClickCallSummary }) => {
  const { overview, details, counselor, tags } = contact;
  const { dateTime, name, customerNumber } = overview;
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

  const nameOrUnknown = name.trim() === '' ? 'Unknown' : name;
  const nameUpperCase = nameOrUnknown.toUpperCase();
  const formattedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
  const { streetAddress, city, stateOrCounty, postalCode, phone1, phone2 } = location;
  const fullLocation = streetAddress + withComma(city) + withComma(stateOrCounty) + withComma(postalCode);
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
          { description: 'Channel', value: 'Work in progress (hrm)' },
          maybeEntry(Boolean(customerNumber), { description: 'Phone Number', value: customerNumber }),
          { description: 'Conversation Duration', value: 'Work in progress (hrm)' },
          { description: 'Counselor', value: counselor },
          { description: 'Date/Time', value: formattedDate },
        ]}
      />
      <Section
        sectionTitle="Caller information"
        entries={[
          { description: 'Name', value: 'Work in progress (hrm)' },
          { description: 'Relationship to Child', value: 'Work in progress (hrm)' },
          { description: 'Address', value: 'Work in progress (hrm)' },
          { description: 'Phone', value: 'Work in progress (hrm)' },
          { description: 'Gender', value: 'Work in progress (hrm)' },
          { description: 'Age Range', value: 'Work in progress (hrm)' },
          { description: 'Language', value: 'Work in progress (hrm)' },
          { description: 'Nationality', value: 'Work in progress (hrm)' },
          { description: 'Ethnicity', value: 'Work in progress (hrm)' },
        ]}
      />
      <Section
        sectionTitle="Child information"
        entries={[
          { description: 'Name', value: nameOrUnknown },
          { description: 'Address', value: fullLocation },
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
      <Section
        sectionTitle="Issue categorization"
        entries={[
          maybeEntry(Boolean(tag1), { description: 'Category 1', value: tag1 }),
          maybeEntry(Boolean(tag2), { description: 'Category 2', value: tag2 }),
          maybeEntry(Boolean(tag3), { description: 'Category 3', value: tag3 }),
          maybeEntry(!(tag1 || tag2 || tag3), { description: 'No category provided', value: '' }),
        ]}
      />
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
    </DetailsContainer>
  );
};

Details.displayName = 'Details';

Details.propTypes = {
  contact: contactType.isRequired,
  handleClickCallSummary: PropTypes.func.isRequired,
};

export default Details;
