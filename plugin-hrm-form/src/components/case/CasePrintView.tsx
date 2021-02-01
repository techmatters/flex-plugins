/* eslint-disable react/jsx-max-depth */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer, Font } from '@react-pdf/renderer';
import { Template } from '@twilio/flex-ui';

import { DetailsHeaderCaseContainer, DetailsHeaderCaseId, DetailsHeaderOfficeName } from '../../styles/case';

Font.register({ family: 'Open Sans', src: 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap' });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    fontFamily: 'Open Sans',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  caseHeader: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '20px',
  },
  caseNumber: {
    fontWeight: 600,
  },
});

type OwnProps = {};
type Props = OwnProps;

const CasePrintView: React.FC<Props> = props => {
  return (
    <PDFViewer style={{ height: '100%' }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.caseHeader}>
            <Text>Child Name</Text>
            <Text style={styles.caseNumber}>Case#: 12345</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

CasePrintView.displayName = 'CasePrintView';

export default CasePrintView;
