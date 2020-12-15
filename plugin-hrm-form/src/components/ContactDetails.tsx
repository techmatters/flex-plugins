import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { IconButton } from '@material-ui/core';
import { Link as LinkIcon } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { Row } from '../styles/HrmStyles';
import { DetailsContainer, NameContainer, DetNameText } from '../styles/search';
import Section from './Section';
import SectionEntry from './SectionEntry';
import callTypes, { channelTypes } from '../states/DomainConstants';
import { isNonDataCallType } from '../states/ValidationRules';
import { contactType } from '../types';
import { formatDuration, formatName, formatCategories, mapChannel, mapChannelForInsights } from '../utils';
import { ContactDetailsSections } from './common/ContactDetails';
import { unNestInformation } from '../services/ContactService';
import type { FormDefinition } from './common/forms/types';
import CallerInformationTab from '../formDefinitions/tabbedForms/CallerInformationTab.json';
import CaseInformationTab from '../formDefinitions/tabbedForms/CaseInformationTab.json';
import ChildInformationTab from '../formDefinitions/tabbedForms/ChildInformationTab.json';

const Details = ({
  contact,
  detailsExpanded,
  showActionIcons,
  handleOpenConnectDialog,
  handleExpandDetailsSection,
}) => {
  // Object destructuring on contact
  const { overview, details, counselor } = contact;
  const { dateTime, name: childName, customerNumber, callType, channel, conversationDuration, categories } = overview;

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const childOrUnknown = formatName(childName);
  const childUpperCased = childOrUnknown.toUpperCase();
  const formattedChannel =
    channel === 'default' ? mapChannelForInsights(details.contactlessTask.channel) : mapChannel(channel);
  const formattedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
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
  } = ContactDetailsSections;

  return (
    <DetailsContainer data-testid="ContactDetails-Container">
      <NameContainer>
        <DetNameText>{childUpperCased}</DetNameText>
        {showActionIcons && (
          <>
            <IconButton
              onClick={handleOpenConnectDialog}
              disabled={!isDataCall}
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <LinkIcon style={{ color: '#ffffff' }} />
            </IconButton>
          </>
        )}
      </NameContainer>
      <Section
        sectionTitle={<Template code="ContactDetails-GeneralDetails" />}
        expanded={detailsExpanded[GENERAL_DETAILS]}
        handleExpandClick={() => handleExpandDetailsSection(GENERAL_DETAILS)}
      >
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-Channel" />}
          value={formattedChannel}
        />
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-PhoneNumber" />}
          value={isPhoneContact ? customerNumber : ''}
        />
        <SectionEntry
          description={<Template code="ContactDetails-GeneralDetails-ConversationDuration" />}
          value={formattedDuration}
        />
        <SectionEntry description={<Template code="ContactDetails-GeneralDetails-Counselor" />} value={counselor} />
        <SectionEntry description={<Template code="ContactDetails-GeneralDetails-DateTime" />} value={formattedDate} />
      </Section>
      {callType === callTypes.caller && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddCallerInfoTab" />}
          expanded={detailsExpanded[CALLER_INFORMATION]}
          handleExpandClick={() => handleExpandDetailsSection(CALLER_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-CallerInformation"
        >
          {(CallerInformationTab as FormDefinition).map(e => (
            <SectionEntry
              key={`CallerInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={unNestInformation(e, contact.details.callerInformation)}
            />
          ))}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddChildInfoTab" />}
          expanded={detailsExpanded[CHILD_INFORMATION]}
          handleExpandClick={() => handleExpandDetailsSection(CHILD_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
        >
          {(ChildInformationTab as FormDefinition).map(e => (
            <SectionEntry
              key={`ChildInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={unNestInformation(e, contact.details.childInformation)}
            />
          ))}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-CategoriesTab" />}
          expanded={detailsExpanded[ISSUE_CATEGORIZATION]}
          handleExpandClick={() => handleExpandDetailsSection(ISSUE_CATEGORIZATION)}
        >
          {formattedCategories.length ? (
            formattedCategories.map((c, index) => (
              <SectionEntry
                key={`Category ${index + 1}`}
                description={
                  <Row>
                    <Template code="Category" /> {index + 1}
                  </Row>
                }
                value={c}
              />
            ))
          ) : (
            <SectionEntry description="No category provided" value="" />
          )}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddCaseInfoTab" />}
          expanded={detailsExpanded[CONTACT_SUMMARY]}
          handleExpandClick={() => handleExpandDetailsSection(CONTACT_SUMMARY)}
        >
          {CaseInformationTab.map(e => (
            <SectionEntry
              key={`CaseInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={contact.details.caseInformation[e.name]}
            />
          ))}
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
  handleExpandDetailsSection: PropTypes.func.isRequired,
  showActionIcons: PropTypes.bool,
};
Details.defaultProps = {
  handleOpenConnectDialog: () => null,
  showActionIcons: false,
};

export default Details;
