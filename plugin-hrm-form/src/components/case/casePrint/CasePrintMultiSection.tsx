/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
import React from 'react';
import { View } from '@react-pdf/renderer';
import { DefinitionVersion } from 'hrm-form-definitions';

import CasePrintSection from './CasePrintSection';
import { CaseSection } from '../../../services/caseSectionService';

type OwnProps = {
  sectionType: string;
  definition: DefinitionVersion;
  values: CaseSection[];
};

type Props = OwnProps;

const CasePrintMultiSection: React.FC<Props> = ({ sectionType, values, definition }) => {
  const { form, label } = definition.caseSectionTypes[sectionType];

  return (
    <View>
      {values &&
        values.length > 0 &&
        values.map((value, i: number) => {
          return (
            <CasePrintSection
              key={`${sectionType}_${value.sectionId}`}
              sectionNameTemplateCode={`CasePrint-TabularSection-Header/${sectionType}`}
              sectionNameTemplateValues={{
                sectionNo: (i + 1).toString(),
                sectionCount: values.length.toString(),
                sectionLabel: label,
              }}
              values={value.sectionTypeSpecificData}
              definitions={form}
            />
          );
        })}
    </View>
  );
};

CasePrintMultiSection.displayName = 'CasePrintMultiSection';

export default CasePrintMultiSection;
