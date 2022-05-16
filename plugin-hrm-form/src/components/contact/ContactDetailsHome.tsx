/* eslint-disable react/prop-types */
import React from 'react';
import { format } from 'date-fns';
import { CircularProgress, IconButton } from '@material-ui/core';
import { Link as LinkIcon } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';
import { connect } from 'react-redux';
import { callTypes } from 'hrm-form-definitions';

import { DetailsContainer, NameContainer, DetNameText } from '../../styles/search';
import Section from '../Section';
import SectionEntry from '../SectionEntry';
import { channelTypes } from '../../states/DomainConstants';
import { isNonDataCallType } from '../../states/ValidationRules';
import { formatDuration, formatName, formatCategories, mapChannelForInsights } from '../../utils';
import { ContactDetailsSections, ContactDetailsSectionsType } from '../common/ContactDetails';
import { unNestInformation } from '../../services/ContactService';
import { namespace, configurationBase, RootState, contactFormsBase } from '../../states';
import * as ConfigActions from '../../states/configuration/actions';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { DetailsContext, toggleDetailSectionExpanded } from '../../states/contacts/contactDetails';

// TODO: complete this type
type OwnProps = {
  contactId: string;
  context: DetailsContext;
  showActionIcons?: boolean;
  handleOpenConnectDialog?: (event: any) => void;
};
// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Details: React.FC<Props> = ({
  context,
  detailsExpanded,
  showActionIcons = false,
  handleOpenConnectDialog,
  definitionVersions,
  updateDefinitionVersion,
  counselorsHash,
  contact,
  toggleSectionExpandedForContext,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const version = contact?.details.definitionVersion;

  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  React.useEffect(() => {
    const fetchDefinitionVersions = async (v: string) => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions(version);
    }
  }, [definitionVersions, updateDefinitionVersion, version, contact]);

  const definitionVersion = definitionVersions[version];

  if (!contact || !definitionVersion)
    return (
      <DetailsContainer>
        <CircularProgress size={50} />
      </DetailsContainer>
    );

  // Object destructuring on contact
  const { overview, details, csamReports } = contact;
  const {
    counselor,
    dateTime,
    name: childName,
    customerNumber,
    callType,
    channel,
    conversationDuration,
    categories,
    createdBy,
  } = overview;

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const childOrUnknown = formatName(childName);
  const childUpperCased = childOrUnknown.toUpperCase();
  const formattedChannel =
    channel === 'default'
      ? mapChannelForInsights(details.contactlessTask.channel.toString())
      : mapChannelForInsights(channel);
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
  const addedBy = counselorsHash[createdBy];
  const counselorName = counselorsHash[counselor];
  const toggleSection = (section: ContactDetailsSectionsType) => toggleSectionExpandedForContext(context, section);

  const csamReportsAttached =
    csamReports &&
    csamReports
      .map(r => `CSAM on ${format(new Date(r.createdAt), 'yyyy MM dd h:mm aaaaa')}m\n#${r.csamReportId}`)
      .join('\n\n');

  if (!definitionVersion)
    return (
      <DetailsContainer>
        <CircularProgress size={50} />
      </DetailsContainer>
    );

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
        handleExpandClick={() => toggleSection(GENERAL_DETAILS)}
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
        <SectionEntry description={<Template code="ContactDetails-GeneralDetails-Counselor" />} value={counselorName} />
        <SectionEntry description={<Template code="ContactDetails-GeneralDetails-DateTime" />} value={formattedDate} />
        {addedBy && addedBy !== counselor && (
          <SectionEntry description={<Template code="ContactDetails-GeneralDetails-AddedBy" />} value={addedBy} />
        )}
      </Section>
      {callType === callTypes.caller && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddCallerInfoTab" />}
          expanded={detailsExpanded[CALLER_INFORMATION]}
          handleExpandClick={() => toggleSection(CALLER_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-CallerInformation"
        >
          {definitionVersion.tabbedForms.CallerInformationTab.map(e => (
            <SectionEntry
              key={`CallerInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={unNestInformation(e, contact.details.callerInformation)}
              definition={e}
            />
          ))}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddChildInfoTab" />}
          expanded={detailsExpanded[CHILD_INFORMATION]}
          handleExpandClick={() => toggleSection(CHILD_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
        >
          {definitionVersion.tabbedForms.ChildInformationTab.map(e => (
            <SectionEntry
              key={`ChildInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={unNestInformation(e, contact.details.childInformation)}
              definition={e}
            />
          ))}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-CategoriesTab" />}
          expanded={detailsExpanded[ISSUE_CATEGORIZATION]}
          handleExpandClick={() => toggleSection(ISSUE_CATEGORIZATION)}
        >
          {formattedCategories.length ? (
            formattedCategories.map((c, index) => (
              <SectionEntry
                key={`Category ${index + 1}`}
                description={
                  <div style={{ display: 'inline-block' }}>
                    <Template code="Category" /> {index + 1}
                  </div>
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
          handleExpandClick={() => toggleSection(CONTACT_SUMMARY)}
        >
          {definitionVersion.tabbedForms.CaseInformationTab.map(e => (
            <SectionEntry
              key={`CaseInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={contact.details.caseInformation[e.name] as boolean | string}
              definition={e}
            />
          ))}
          {csamReportsAttached && (
            <SectionEntry
              key="CaseInformation-AttachedCSAMReports"
              description={<Template code="CSAMReportForm-ReportsSubmitted" />}
              value={csamReportsAttached}
            />
          )}
        </Section>
      )}
    </DetailsContainer>
  );
};

Details.displayName = 'Details';

Details.defaultProps = {
  handleOpenConnectDialog: () => null,
  showActionIcons: false,
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  definitionVersions: state[namespace][configurationBase].definitionVersions,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  contact: state[namespace][contactFormsBase].existingContacts[ownProps.contactId]?.contact,
  detailsExpanded: state[namespace][contactFormsBase].contactDetails[ownProps.context].detailsExpanded,
});

const mapDispatchToProps = {
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
  toggleSectionExpandedForContext: toggleDetailSectionExpanded,
};

export default connect(mapStateToProps, mapDispatchToProps)(Details);
