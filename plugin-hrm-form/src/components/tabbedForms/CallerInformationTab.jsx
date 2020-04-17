import React from 'react';
import PropTypes from 'prop-types';

import { callerInformationType } from '../../types';
import FieldText from '../FieldText';
import FieldSelect from '../FieldSelect';
import { ColumnarBlock, Container, NameFields, TwoColumnLayout } from '../../styles/HrmStyles';

const CallerInformationTab = ({ callerInformation, defaultEventHandlers }) => (
  <Container>
    <NameFields>
      <FieldText
        id="CallerInformation_FirstName"
        label="First name"
        field={callerInformation.name.firstName}
        {...defaultEventHandlers(['callerInformation', 'name'], 'firstName')}
      />
      <FieldText
        id="CallerInformation_LastName"
        label="Last name"
        field={callerInformation.name.lastName}
        {...defaultEventHandlers(['callerInformation', 'name'], 'lastName')}
      />
    </NameFields>

    <TwoColumnLayout>
      <ColumnarBlock>
        <FieldSelect
          field={callerInformation.relationshipToChild}
          id="CallerInformation_RelationshipToChild"
          name="relationshipToChild"
          label="Relationship to Child"
          options={['Friend', 'Neighbor', 'Parent', 'Grandparent', 'Teacher', 'Other']}
          {...defaultEventHandlers(['callerInformation'], 'relationshipToChild')}
        />

        <FieldSelect
          field={callerInformation.gender}
          id="CallerInformation_Gender"
          name="gender"
          label="Gender"
          options={['Male', 'Female', 'Other', 'Unknown']}
          {...defaultEventHandlers(['callerInformation'], 'gender')}
        />

        <FieldSelect
          field={callerInformation.age}
          id="CallerInformation_Age"
          name="age"
          label="Age"
          options={['0-3', '4-6', '7-9', '10-12', '13-15', '16-17', '18-25', '>25']}
          {...defaultEventHandlers(['callerInformation'], 'age')}
        />

        <FieldSelect
          field={callerInformation.language}
          id="CallerInformation_Language"
          name="language"
          label="Language"
          options={['Language 1', 'Language 2', 'Language 3']}
          {...defaultEventHandlers(['callerInformation'], 'language')}
        />

        <FieldSelect
          field={callerInformation.nationality}
          id="CallerInformation_Nationality"
          name="nationality"
          label="Nationality"
          options={['Nationality 1', 'Nationality 2', 'Nationality 3']}
          {...defaultEventHandlers(['callerInformation'], 'nationality')}
        />

        <FieldSelect
          field={callerInformation.ethnicity}
          id="CallerInformation_Ethnicity"
          name="ethnicity"
          label="Ethnicity"
          options={['Ethnicity 1', 'Ethnicity 2', 'Ethnicity 3']}
          {...defaultEventHandlers(['callerInformation'], 'ethnicity')}
        />
      </ColumnarBlock>

      <ColumnarBlock>
        <FieldText
          id="CallerInformation_StreetAddress"
          label="Street address"
          field={callerInformation.location.streetAddress}
          {...defaultEventHandlers(['callerInformation', 'location'], 'streetAddress')}
        />

        <FieldText
          id="CallerInformation_City"
          label="City"
          field={callerInformation.location.city}
          {...defaultEventHandlers(['callerInformation', 'location'], 'city')}
        />

        <FieldText
          id="CallerInformation_State/Country"
          label="State/County"
          field={callerInformation.location.stateOrCounty}
          {...defaultEventHandlers(['callerInformation', 'location'], 'stateOrCounty')}
        />

        <FieldText
          id="CallerInformation_PostalCode"
          label="Postal code"
          field={callerInformation.location.postalCode}
          {...defaultEventHandlers(['callerInformation', 'location'], 'postalCode')}
        />

        <FieldText
          id="CallerInformation_Phone#1"
          label="Phone #1"
          field={callerInformation.location.phone1}
          {...defaultEventHandlers(['callerInformation', 'location'], 'phone1')}
        />

        <FieldText
          id="CallerInformation_Phone#2"
          label="Phone #2"
          field={callerInformation.location.phone2}
          {...defaultEventHandlers(['callerInformation', 'location'], 'phone2')}
        />
      </ColumnarBlock>
    </TwoColumnLayout>
  </Container>
);

CallerInformationTab.displayName = 'CallerInformationTab';
CallerInformationTab.propTypes = {
  callerInformation: callerInformationType.isRequired,
  defaultEventHandlers: PropTypes.func.isRequired,
};

export default CallerInformationTab;
