/* eslint-disable react/prop-types */
import React from 'react';
import { View } from '@react-pdf/renderer';

import CasePrintSection from './CasePrintSection';
import { FormDefinition } from 'hrm-form-definitions';
import { HouseholdEntry, PerpetratorEntry, IncidentEntry, ReferralEntry } from '../../../types/types';

type OwnProps = {
  sectionName: string;
  sectionKey: 'household' | 'perpetrator' | 'incident' | 'referral';
  values: (HouseholdEntry | PerpetratorEntry | IncidentEntry | ReferralEntry)[];
  definitions: FormDefinition;
};

type Props = OwnProps;

const CasePrintMultiSection: React.FC<Props> = ({ sectionName, sectionKey, values, definitions }) => {
  return (
    <View>
      {values &&
        values.length > 0 &&
        values.map((value, i: number) => {
          const customSectionName = `${sectionName} ${i + 1} of ${values.length}`;
          return (
            <CasePrintSection
              key={`${sectionName}_${i}`}
              sectionName={customSectionName}
              values={sectionKey === 'referral' ? value : value[sectionKey]}
              definitions={definitions}
            />
          );
        })}
    </View>
  );
};

CasePrintMultiSection.displayName = 'CasePrintMultiSection';

export default CasePrintMultiSection;
