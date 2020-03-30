import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Button } from '@material-ui/core';
import { MoreHoriz } from '@material-ui/icons';

import { DetailsContainer, NameContainer, DetNameText, ContactDetailsIcon } from '../../../Styles/search';
import Category from './Category';
import CategoryEntry from './CategoryEntry';
import { contactType } from '../../../types';

const MoreHorizIcon = ContactDetailsIcon(MoreHoriz);

/**
 * @param {string} s
 * @returns {string} if s is not empty, appends it with a comma and a space
 */
const withComma = s => (s.trim() ? `, ${s}` : '');

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
  const formatedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
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
      <Category category="General details">
        <CategoryEntry description="Channel" value="Work in progress (hrm)" />
        {customerNumber && <CategoryEntry description="Phone Number" value={customerNumber} />}
        <CategoryEntry description="Conversation Duration" value="Work in progress (hrm)" />
        <CategoryEntry description="Counselor" value={counselor} />
        <CategoryEntry description="Date/Time" value={formatedDate} />
      </Category>
      <Category category="Caller information">
        <CategoryEntry description="Name" value="Work in progress (hrm)" />
        <CategoryEntry description="Relationship to Child" value="Work in progress (hrm)" />
        <CategoryEntry description="Address" value="Work in progress (hrm)" />
        <CategoryEntry description="Phone" value="Work in progress (hrm)" />
        <CategoryEntry description="Gender" value="Work in progress (hrm)" />
        <CategoryEntry description="Age Range" value="Work in progress (hrm)" />
        <CategoryEntry description="Language" value="Work in progress (hrm)" />
        <CategoryEntry description="Nationality" value="Work in progress (hrm)" />
        <CategoryEntry description="Ethnicity" value="Work in progress (hrm)" />
      </Category>
      <Category category="Child information">
        <CategoryEntry description="Name" value={nameOrUnknown} />
        <CategoryEntry description="Address" value={fullLocation} />
        {phone1 && <CategoryEntry description="Phone" value={phone1} />}
        {phone2 && <CategoryEntry description="Phone" value={phone2} />}
        <CategoryEntry description="Gender" value={gender} />
        <CategoryEntry description="Age Range" value={age} />
        <CategoryEntry description="Language" value={language} />
        <CategoryEntry description="Nationality" value={nationality} />
        <CategoryEntry description="Ethnicity" value={ethnicity} />
        <CategoryEntry description="Is Refugee?" value={refugee} />
      </Category>
      <Category category="Issue categorization">
        {tag1 && <CategoryEntry description="Category 1" value={tag1} />}
        {tag2 && <CategoryEntry description="Category 2" value={tag2} />}
        {tag3 && <CategoryEntry description="Category 3" value={tag3} />}
        {!(tag1 || tag2 || tag3) && <CategoryEntry description="No category provided" value="" />}
      </Category>
      <Category category="Case summary">
        <CategoryEntry description="Call Summary" value={callSummary} />
        <CategoryEntry description="Status" value={status} />
        <CategoryEntry description="Referred by?" value={referredTo} />
        <CategoryEntry description="Keep Confidential?" value={keepConfidential} />
        <CategoryEntry description="OK for the case worker to call?" value={okForCaseWorkerToCall} />
        <CategoryEntry description="How did the child hear about us?" value={howDidTheChildHearAboutUs} />
        <CategoryEntry description="Did you discuss right with the child?" value={didYouDiscussRightsWithTheChild} />
        <CategoryEntry
          description="Did the child feel we solved their problem?"
          value={didTheChildFeelWeSolvedTheirProblem}
        />
        <CategoryEntry
          description="Would the child recommend us to a friend?"
          value={wouldTheChildRecommendUsToAFriend}
        />
      </Category>
    </DetailsContainer>
  );
};

Details.displayName = 'Details';

Details.propTypes = {
  contact: contactType.isRequired,
  handleClickCallSummary: PropTypes.func.isRequired,
};

export default Details;
