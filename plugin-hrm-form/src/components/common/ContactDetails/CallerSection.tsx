/* eslint-disable react/prop-types */
import React from 'react';
import { Template } from '@twilio/flex-ui';

import Section from '../../Section';
import SectionEntry from '../../SectionEntry';
import { CallerFormValues } from '../forms/CallerForm';
import { formatName, formatAddress } from '../../../utils';

type OwnProps = {
  sectionTitleTemplate: string;
  values: CallerFormValues;
  expanded: boolean;
  hideIcon?: boolean;
  handleExpandClick: () => void;
};

type Props = OwnProps;

const CallerSection: React.FC<Props> = ({ values, sectionTitleTemplate, expanded, hideIcon, handleExpandClick }) => {
  const callerName = `${values.name.firstName} ${values.name.lastName}`;
  const callerOrUnknown = formatName(callerName);
  const formattedCallerAddress = formatAddress(
    values.location.streetAddress,
    values.location.city,
    values.location.stateOrCounty,
    values.location.postalCode,
  );

  return (
    <Section
      sectionTitle={<Template code={sectionTitleTemplate} />}
      expanded={expanded}
      hideIcon={hideIcon}
      handleExpandClick={handleExpandClick}
    >
      <SectionEntry description={<Template code="CallerSection-Name" />} value={callerOrUnknown} />
      <SectionEntry
        description={<Template code="CallerSection-RelationshipToChild" />}
        value={values.relationshipToChild}
      />
      <SectionEntry description={<Template code="CallerSection-Address" />} value={formattedCallerAddress} />
      <SectionEntry description={<Template code="CallerSection-Phone#1" />} value={values.location.phone1} />
      <SectionEntry description={<Template code="CallerSection-Phone#2" />} value={values.location.phone2} />
      <SectionEntry description={<Template code="CallerSection-Gender" />} value={values.gender} />
      <SectionEntry description={<Template code="CallerSection-AgeRange" />} value={values.age} />
      <SectionEntry description={<Template code="CallerSection-Language" />} value={values.language} />
      <SectionEntry description={<Template code="CallerSection-Nationality" />} value={values.nationality} />
      <SectionEntry description={<Template code="CallerSection-Ethnicity" />} value={values.ethnicity} />
    </Section>
  );
};

CallerSection.displayName = 'CallerSection';

export default CallerSection;
