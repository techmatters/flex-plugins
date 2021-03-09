/* eslint-disable react/prop-types */
import React from 'react';
import { View } from '@react-pdf/renderer';

import CasePrintSection from './CasePrintSection';
import { FormDefinition } from '../../common/forms/types';

type OwnProps = {
  sectionName: string;
  sectionKey: 'household' | 'perpetrator' | 'incident';
  values: any; // ToDO: imptove this type
  definitions: FormDefinition;
};

type Props = OwnProps;

const CasePrintMultiSection: React.FC<Props> = ({ sectionName, sectionKey, values, definitions }) => {
  return (
    <View>
      {values.map((value, i: number) => {
        const customSectionName = `${sectionName} ${i + 1} of ${values.length}`;
        return (
          <CasePrintSection
            key={value.key}
            sectionName={customSectionName}
            values={value[sectionKey]}
            definitions={definitions}
          />
        );
      })}
    </View>
  );
};

CasePrintMultiSection.displayName = 'CasePrintMultiSection';

export default CasePrintMultiSection;
