/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/jsx-max-depth */
import React from 'react';
import PropTypes from 'prop-types';
import { Page, Text, View, Document, PDFViewer, Font, Image } from '@react-pdf/renderer';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import CasePrintSection from './CasePrintSection';
import CasePrintSummary from './CasePrintSummary';
import styles from './CasePrintStyles';
import { CasePrintViewContainer, HiddenText } from '../../../styles/HrmStyles';
import source from '../../../resources/ZA_childline_logo.jpg';

type OwnProps = {
  onClickClose: () => void;
  caseDetails: any; // ToDO: create a type here
};
type Props = OwnProps;

Font.register({
  family: 'Open Sans',
  src: 'http://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0ef8pkAg.ttf',
});

const callerInfoSection = {
  sectionName: 'Caller Information',
  fieldValues: [
    { label: 'Field One', value: 'Yes' },
    { label: 'Field Two', value: 'No' },
    { label: 'Field Three', value: 'Yes' },
    { label: 'Field Four', value: 'Yes' },
    { label: 'Field Five', value: 'No' },
  ],
};

const childInfoSection = {
  sectionName: 'Child Information',
  fieldValues: [
    { label: 'First Name', value: 'Child' },
    { label: 'Last Name', value: 'Child' },
    { label: 'Field One', value: 'Yes' },
    { label: 'Field Two', value: 'No' },
    { label: 'Field Three', value: 'Yes' },
  ],
};

const incidentSection = {
  sectionName: 'Incidents',
  fieldValues: [
    { label: 'Field One', value: 'XXXXX' },
    { label: 'Field Two', value: 'YYYYY' },
    { label: 'Field Three', value: '......' },
    { label: 'Field Four', value: '...............' },
    { label: 'Field Five', value: '....................' },
    { label: 'Field Six', value: 'AAAAA' },
    { label: 'Field Seven', value: 'BBBBB' },
  ],
};

const householdSection = {
  sectionName: 'Household Members',
  fieldValues: [
    { label: 'Field One', value: 'Yes' },
    { label: 'Field Two', value: 'No' },
    { label: 'Field Three', value: '......' },
    { label: 'Field Four', value: '...............' },
    { label: 'Field Five', value: '....................' },
  ],
};

const perpetratorSection = {
  sectionName: 'Perpetrators',
  fieldValues: [
    { label: 'Field One', value: 'Yes' },
    { label: 'Field Two', value: 'No' },
    { label: 'Field Three', value: '......' },
    { label: 'Field Four', value: '...............' },
    { label: 'Field Five', value: '....................' },
  ],
};

const referralsSection = {
  sectionName: 'Referrals',
  fieldValues: [
    { label: 'Field One', value: 'Yes' },
    { label: 'Field Two', value: 'No' },
  ],
};

const notesSection = {
  sectionName: 'Notes',
  fieldValues: [
    { label: 'Field One', value: 'Yes' },
    { label: 'Field Two', value: 'No' },
  ],
};

const summary =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam convallis magna a suscipit scelerisque. Vestibulum molestie mi ipsum, eu elementum augue malesuada at. Phasellus ac nibh in nibh ullamcorper luctus. Fusce tristique dui nulla. In lacinia sem a mi congue, eget tincidunt risus euismod. Aliquam euismod metus eu augue ultrices, non sagittis tellus aliquam. Phasellus non lacus et augue convallis lacinia et ac nisl. Nulla interdum lectus eget nulla pulvinar pretium. Aenean laoreet enim vitae diam tristique, dapibus suscipit ligula placerat. Maecenas pellentesque egestas metus sit amet ornare. Proin vel dui nulla. Nam fringilla venenatis justo in porta.';

const CasePrintView: React.FC<Props> = ({ onClickClose, caseDetails }) => {
  return (
    <CasePrintViewContainer>
      <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }} data-testid="CasePrint-CloseCross">
        <HiddenText>
          <Template code="Case-CloseButton" />
        </HiddenText>
        <Close />
      </ButtonBase>
      <PDFViewer style={{ height: '100%' }}>
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.caseHeader}>
              <View style={styles.nameContainer}>
                <Text style={styles.childName}>{caseDetails.name}</Text>
                <Text>Case#: {caseDetails.id}</Text>
              </View>
              <Image style={styles.logo} src={source} />
            </View>
            <View>
              <Text style={styles.caseDetailsLabel}>Case Details</Text>
              <View style={styles.caseDetailsSection}>
                <View style={styles.caseDetailsItem}>
                  <Text>Case Status</Text>
                  <Text style={{ marginTop: 5 }}>OPEN</Text>
                </View>
                <View style={styles.caseDetailsItem}>
                  <Text>Opened</Text>
                  <Text style={{ marginTop: 5 }}>11/10/2020</Text>
                </View>
                <View>
                  <Text>CHILD IS AT RISK</Text>
                </View>
              </View>
            </View>
            <CasePrintSection {...callerInfoSection} />
            <CasePrintSection {...childInfoSection} />
            <CasePrintSection {...incidentSection} />
            <CasePrintSection {...householdSection} />
            <CasePrintSection {...perpetratorSection} />
            <CasePrintSection {...referralsSection} />
            <CasePrintSection {...notesSection} />
            <CasePrintSummary summary={summary} />
            <Text
              style={styles.pageNumber}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
              fixed
            />
          </Page>
        </Document>
      </PDFViewer>
    </CasePrintViewContainer>
  );
};

CasePrintView.propTypes = {
  onClickClose: PropTypes.func.isRequired,
  caseDetails: PropTypes.object.isRequired,
};

CasePrintView.displayName = 'CasePrintView';

export default CasePrintView;
