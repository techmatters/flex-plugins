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
/* eslint-disable dot-notation */
import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { DefinitionVersion } from 'hrm-form-definitions';

import { formatName } from '../../../utils/formatters';
import styles from './styles';
import { getTemplateStrings } from '../../../hrmConfig';
import { FullCaseSection } from '../../../services/caseSectionService';
import { getSectionText } from '../../../states/case/caseActivities';

type OwnProps = {
  sectionType: string;
  sections: FullCaseSection[];
  counselorsHash: { [sid: string]: string };
  formDefinition: DefinitionVersion;
};

type Props = OwnProps;

const CasePrintSectionsList: React.FC<Props> = ({ sectionType, sections, counselorsHash, formDefinition }) => {
  const strings = getTemplateStrings();

  if (!sections || sections.length === 0) return null;

  return (
    <View>
      <View style={styles['sectionHeader']}>
        <Text style={styles['whiteText']}>{strings[`CasePrint-TabularSection-Header/${sectionType}`]}</Text>
      </View>
      {sections &&
        sections.length > 0 &&
        sections.map((noteSection, i) => {
          const { createdBy: twilioWorkerId, createdAt } = noteSection;
          return (
            <View key={i} style={{ ...styles['sectionBody'], ...styles['caseSummaryText'] }}>
              <View style={{ ...styles.flexRow, justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 600 }}>{formatName(counselorsHash[twilioWorkerId])}</Text>
                <Text style={{ fontStyle: 'italic' }}>{`${format(createdAt, 'MMM d, yyyy / h:mm aaaaa')}m`}</Text>
              </View>
              <View>
                <Text style={styles['noteSummaryText']}>{getSectionText(noteSection, formDefinition)}</Text>
              </View>
            </View>
          );
        })}
    </View>
  );
};

CasePrintSectionsList.displayName = 'CasePrintNotes';

export default CasePrintSectionsList;
