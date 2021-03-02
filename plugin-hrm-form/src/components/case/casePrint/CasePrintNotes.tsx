/* eslint-disable react/prop-types */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';

import { getConfig } from '../../../HrmFormPlugin';
import styles from './styles';

type Note = {
  counselor: string;
  date: string;
  note: string;
};

type OwnProps = {
  notes: Note[];
};

type Props = OwnProps;

const CasePrintNotes: React.FC<Props> = ({ notes }) => {
  const { strings } = getConfig();

  return (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={styles.whiteText}>{strings['Case-Notes']}</Text>
      </View>
      {notes.map((note, i) => {
        return (
          <View key={i} style={{ ...styles.sectionBody, ...styles.caseSummaryText }}>
            <View style={{ ...styles.flexRow, justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 600 }}>{note.counselor}</Text>
              <Text style={{ fontStyle: 'italic' }}>{note.date}</Text>
            </View>
            <View>
              <Text style={styles.noteSummaryText}>{note.note}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

CasePrintNotes.displayName = 'CasePrintNotes';

export default CasePrintNotes;
