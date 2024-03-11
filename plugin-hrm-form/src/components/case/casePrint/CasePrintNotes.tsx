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

import { formatName, formatStringToDateAndTime } from '../../../utils';
import styles from './styles';
import { getTemplateStrings } from '../../../hrmConfig';
import { ApiCaseSection } from '../../../services/caseSectionService';

type OwnProps = {
  notes: ApiCaseSection[];
  counselorsHash: { [sid: string]: string };
};

type Props = OwnProps;

const CasePrintNotes: React.FC<Props> = ({ notes, counselorsHash }) => {
  const strings = getTemplateStrings();

  if (!notes || notes.length === 0) return null;

  return (
    <View>
      <View style={styles['sectionHeader']}>
        <Text style={styles['whiteText']}>{strings['Case-Notes']}</Text>
      </View>
      {notes &&
        notes.length > 0 &&
        notes.map(({ createdBy, sectionTypeSpecificData: note, createdAt }, i) => {
          return (
            <View key={i} style={{ ...styles['sectionBody'], ...styles['caseSummaryText'] }}>
              <View style={{ ...styles.flexRow, justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 600 }}>{formatName(counselorsHash[createdBy])}</Text>
                <Text style={{ fontStyle: 'italic' }}>{formatStringToDateAndTime(createdAt)}</Text>
              </View>
              <View>
                <Text style={styles['noteSummaryText']}>{note.text}</Text>
              </View>
            </View>
          );
        })}
    </View>
  );
};

CasePrintNotes.displayName = 'CasePrintNotes';

export default CasePrintNotes;
