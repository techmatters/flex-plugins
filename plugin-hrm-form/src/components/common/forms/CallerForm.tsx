/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import FieldText from '../../FieldText';
import FieldSelect from '../../FieldSelect';
import { ColumnarBlock, Container, NameFields, TwoColumnLayout } from '../../../styles/HrmStyles';
import { genderOptions, ageOptions } from '../../tabbedForms/SelectOptions';
import { FormFieldType, FormValues, DefaultEventHandlers } from './types';

export type CallerFormInformation = {
  name: {
    firstName: FormFieldType;
    lastName: FormFieldType;
  };
  relationshipToChild: FormFieldType;
  gender: FormFieldType;
  age: FormFieldType;
  language: FormFieldType;
  nationality: FormFieldType;
  ethnicity: FormFieldType;
  location: {
    streetAddress: FormFieldType;
    city: FormFieldType;
    stateOrCounty: FormFieldType;
    postalCode: FormFieldType;
    phone1: FormFieldType;
    phone2: FormFieldType;
  };
};

export type CallerFormValues = FormValues<CallerFormInformation>;

type Props = {
  callerInformation: CallerFormInformation;
  defaultEventHandlers: DefaultEventHandlers;
};

export type { Props as CallerFormProps };

export const CallerForm: React.FC<Props> = ({ callerInformation, defaultEventHandlers }) => (
  <Container>
    <NameFields>
      <FieldText
        id="CallerInformation_FirstName"
        label={<Template code="CallerForm-FirstName" />}
        field={callerInformation.name.firstName}
        {...defaultEventHandlers(['name'], 'firstName')}
      />
      <FieldText
        id="CallerInformation_LastName"
        label={<Template code="CallerForm-LastName" />}
        field={callerInformation.name.lastName}
        {...defaultEventHandlers(['name'], 'lastName')}
      />
    </NameFields>
    <TwoColumnLayout>
      <ColumnarBlock>
        <FieldSelect
          field={callerInformation.relationshipToChild}
          id="CallerInformation_RelationshipToChild"
          name="relationshipToChild"
          label={<Template code="CallerForm-RelationshipToChild" />}
          options={['Friend', 'Neighbor', 'Parent', 'Grandparent', 'Teacher', 'Other']}
          {...defaultEventHandlers([], 'relationshipToChild')}
        />
        <FieldSelect
          field={callerInformation.gender}
          id="CallerInformation_Gender"
          name="gender"
          label={<Template code="CallerForm-Gender" />}
          options={genderOptions}
          {...defaultEventHandlers([], 'gender')}
        />
        <FieldSelect
          field={callerInformation.age}
          id="CallerInformation_Age"
          name="age"
          label={<Template code="CallerForm-Age" />}
          options={ageOptions}
          {...defaultEventHandlers([], 'age')}
        />
        <FieldSelect
          field={callerInformation.language}
          id="CallerInformation_Language"
          name="language"
          label={<Template code="CallerForm-Language" />}
          options={['Language 1', 'Language 2', 'Language 3']}
          {...defaultEventHandlers([], 'language')}
        />
        <FieldSelect
          field={callerInformation.nationality}
          id="CallerInformation_Nationality"
          name="nationality"
          label={<Template code="CallerForm-Nationality" />}
          options={['Nationality 1', 'Nationality 2', 'Nationality 3']}
          {...defaultEventHandlers([], 'nationality')}
        />
        <FieldSelect
          field={callerInformation.ethnicity}
          id="CallerInformation_Ethnicity"
          name="ethnicity"
          label={<Template code="CallerForm-Ethnicity" />}
          options={['Ethnicity 1', 'Ethnicity 2', 'Ethnicity 3']}
          {...defaultEventHandlers([], 'ethnicity')}
        />
      </ColumnarBlock>
      <ColumnarBlock>
        <FieldText
          id="CallerInformation_StreetAddress"
          label={<Template code="CallerForm-StreetAddress" />}
          field={callerInformation.location.streetAddress}
          {...defaultEventHandlers(['location'], 'streetAddress')}
        />
        <FieldText
          id="CallerInformation_City"
          label={<Template code="CallerForm-City" />}
          field={callerInformation.location.city}
          {...defaultEventHandlers(['location'], 'city')}
        />
        <FieldText
          id="CallerInformation_State/Country"
          label={<Template code="CallerForm-State/County" />}
          field={callerInformation.location.stateOrCounty}
          {...defaultEventHandlers(['location'], 'stateOrCounty')}
        />
        <FieldText
          id="CallerInformation_PostalCode"
          label={<Template code="CallerForm-PostalCode" />}
          field={callerInformation.location.postalCode}
          {...defaultEventHandlers(['location'], 'postalCode')}
        />
        <FieldText
          id="CallerInformation_Phone#1"
          label={<Template code="CallerForm-Phone#1" />}
          field={callerInformation.location.phone1}
          {...defaultEventHandlers(['location'], 'phone1')}
        />
        <FieldText
          id="CallerInformation_Phone#2"
          label={<Template code="CallerForm-Phone#2" />}
          field={callerInformation.location.phone2}
          {...defaultEventHandlers(['location'], 'phone2')}
        />
      </ColumnarBlock>
    </TwoColumnLayout>
  </Container>
);

CallerForm.displayName = 'CallerForm';
