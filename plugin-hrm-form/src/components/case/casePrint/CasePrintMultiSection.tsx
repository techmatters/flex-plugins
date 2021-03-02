/* eslint-disable react/prop-types */
import React from 'react';
import { View } from '@react-pdf/renderer';

import CasePrintSection from './CasePrintSection';

type Section = {
  key: number;
  fieldValues: SectionField[];
};

type SectionField = {
  label: string;
  value?: string;
};

type OwnProps = {
  sectionName: string;
  sectionValues: Section[];
};

type Props = OwnProps;

const CasePrintMultiSection: React.FC<Props> = ({ sectionName, sectionValues }) => {
  return (
    <View>
      {sectionValues.map(value => {
        const customSectionName = `${sectionName} ${value.key} of ${sectionValues.length}`;
        return <CasePrintSection key={value.key} sectionName={customSectionName} fieldValues={value.fieldValues} />;
      })}
    </View>
  );
};

CasePrintMultiSection.displayName = 'CasePrintMultiSection';

export default CasePrintMultiSection;
