/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import { NoteActivity } from '../../../states/case/types';
import { formatName, formatStringToDateAndTime } from '../../../utils';
import styles from './styles';

type OwnProps = {
  notes: NoteActivity[];
  counselorsHash: { [sid: string]: string };
};

type Props = OwnProps;

const CasePrintNotes: React.FC<Props> = ({ notes, counselorsHash }) => {
  const { strings } = getConfig();

  if (!notes || notes.length === 0) return null;

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{strings['Case-Notes']}</Text>
      </View>
      {notes &&
        notes.length > 0 &&
        notes.map((note, i) => {
          return (
            <View key={i} style={{ ...styles.sectionBody, ...styles.caseSummaryText }}>
              <View style={{ ...styles.flexRow, justifyContent: 'space-between' }}>
                <Text style={{ fontWeight: 600 }}>{formatName(counselorsHash[note.twilioWorkerId])}</Text>
                <Text style={{ fontStyle: 'italic' }}>{formatStringToDateAndTime(note.date)}</Text>
              </View>
              <View>
                <Text style={styles.noteSummaryText}>{note.text}</Text>
              </View>
            </View>
          );
        })}
    </View>
  );
};

CasePrintNotes.displayName = 'CasePrintNotes';

export default CasePrintNotes;
