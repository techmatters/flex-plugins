import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from '@material-ui/core';

import { childInformationType } from '../../types';
import FieldText from '../FieldText';
import FieldSelect from '../FieldSelect';
import {
  ColumnarBlock,
  Container,
  NameFields,
  TwoColumnLayout,
  CheckboxField,
  StyledCheckboxLabel,
} from '../../styles/HrmStyles';
import { genderOptions, ageOptions } from './SelectOptions';

const ChildInformationTab = ({ childInformation, handleCheckboxClick, defaultEventHandlers }) => (
  <Container>
    <NameFields>
      <FieldText
        id="ChildInformation_FirstName"
        label="First name"
        field={childInformation.name.firstName}
        {...defaultEventHandlers(['childInformation', 'name'], 'firstName')}
      />
      <FieldText
        id="ChildInformation_LastName"
        label="Last name"
        field={childInformation.name.lastName}
        {...defaultEventHandlers(['childInformation', 'name'], 'lastName')}
      />
    </NameFields>

    <TwoColumnLayout>
      <ColumnarBlock>
        <FieldSelect
          field={childInformation.gender}
          id="ChildInformation_Gender"
          name="gender"
          label="Gender"
          options={genderOptions}
          {...defaultEventHandlers(['childInformation'], 'gender')}
        />

        <FieldSelect
          field={childInformation.age}
          id="ChildInformation_Age"
          name="age"
          label="Age"
          options={ageOptions}
          {...defaultEventHandlers(['childInformation'], 'age')}
        />

        <FieldSelect
          field={childInformation.language}
          id="ChildInformation_Language"
          name="language"
          label="Language"
          options={['Language 1', 'Language 2', 'Language 3']}
          {...defaultEventHandlers(['childInformation'], 'language')}
        />

        <FieldSelect
          field={childInformation.nationality}
          id="ChildInformation_Nationality"
          name="nationality"
          label="Nationality"
          options={['Nationality 1', 'Nationality 2', 'Nationality 3']}
          {...defaultEventHandlers(['childInformation'], 'nationality')}
        />

        <FieldSelect
          field={childInformation.ethnicity}
          id="ChildInformation_Ethnicity"
          name="ethnicity"
          label="Ethnicity"
          options={['Ethnicity 1', 'Ethnicity 2', 'Ethnicity 3']}
          {...defaultEventHandlers(['childInformation'], 'ethnicity')}
        />

        <CheckboxField>
          <Checkbox
            name="refugee"
            id="ChildInformation_Refugee"
            checked={childInformation.refugee.value}
            onClick={() => handleCheckboxClick(['childInformation'], 'refugee', !childInformation.refugee.value)}
          />
          <StyledCheckboxLabel htmlFor="ChildInformation_Refugee">Refugee?</StyledCheckboxLabel>
        </CheckboxField>

        <CheckboxField>
          <Checkbox
            name="disabledOrSpecialNeeds"
            id="ChildInformation_DisabledOrSpecialNeeds"
            checked={childInformation.disabledOrSpecialNeeds.value}
            onClick={() =>
              handleCheckboxClick(
                ['childInformation'],
                'disabledOrSpecialNeeds',
                !childInformation.disabledOrSpecialNeeds.value,
              )
            }
          />
          <StyledCheckboxLabel htmlFor="ChildInformation_DisabledOrSpecialNeeds">
            Disabled/Special Needs?
          </StyledCheckboxLabel>
        </CheckboxField>

        <CheckboxField>
          <Checkbox
            name="hiv"
            id="ChildInformation_HIV"
            checked={childInformation.hiv.value}
            onClick={() => handleCheckboxClick(['childInformation'], 'hiv', !childInformation.hiv.value)}
          />
          <StyledCheckboxLabel htmlFor="ChildInformation_HIV">HIV Positive?</StyledCheckboxLabel>
        </CheckboxField>
      </ColumnarBlock>

      <ColumnarBlock>
        <FieldText
          id="ChildInformation_StreetAddress"
          label="Street address"
          field={childInformation.location.streetAddress}
          {...defaultEventHandlers(['childInformation', 'location'], 'streetAddress')}
        />

        <FieldText
          id="ChildInformation_City"
          label="City"
          field={childInformation.location.city}
          {...defaultEventHandlers(['childInformation', 'location'], 'city')}
        />

        <FieldText
          id="ChildInformation_State/Country"
          label="State/County"
          field={childInformation.location.stateOrCounty}
          {...defaultEventHandlers(['childInformation', 'location'], 'stateOrCounty')}
        />

        <FieldText
          id="ChildInformation_PostalCode"
          label="Postal code"
          field={childInformation.location.postalCode}
          {...defaultEventHandlers(['childInformation', 'location'], 'postalCode')}
        />

        <FieldText
          id="ChildInformation_Phone#1"
          label="Phone #1"
          field={childInformation.location.phone1}
          {...defaultEventHandlers(['childInformation', 'location'], 'phone1')}
        />

        <FieldText
          id="ChildInformation_Phone#2"
          label="Phone #2"
          field={childInformation.location.phone2}
          {...defaultEventHandlers(['childInformation', 'location'], 'phone2')}
        />

        <FieldText
          id="ChildInformation_SchoolName"
          label="School name"
          field={childInformation.school.name}
          {...defaultEventHandlers(['childInformation', 'school'], 'name')}
        />

        <FieldText
          id="ChildInformation_GradeLevel"
          label="Grade level"
          field={childInformation.school.gradeLevel}
          {...defaultEventHandlers(['childInformation', 'school'], 'gradeLevel')}
        />
      </ColumnarBlock>
    </TwoColumnLayout>
  </Container>
);

ChildInformationTab.displayName = 'ChildInformationTab';
ChildInformationTab.propTypes = {
  childInformation: childInformationType.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  defaultEventHandlers: PropTypes.func.isRequired,
};

export default ChildInformationTab;
