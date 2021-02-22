/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-max-depth */
import React from 'react';
import { Page, Text, View, Document, PDFViewer, Image } from '@react-pdf/renderer';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import CasePrintSection from './CasePrintSection';
import CasePrintSummary from './CasePrintSummary';
import styles from './CasePrintStyles';
import { CasePrintViewContainer, HiddenText } from '../../../styles/HrmStyles';
import source from '../../../resources/ZA_childline_logo.jpg';
import CasePrintDetails from './CasePrintDetails';
import type { CaseDetails } from '../../../states/case/types';

type OwnProps = {
  onClickClose: () => void;
  caseDetails: CaseDetails;
};
type Props = OwnProps;

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
    { label: 'Field Six', value: '....................' },
    { label: 'Field Seven', value: '....................' },
    { label: 'Field Eight', value: '....................' },
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
            <View fixed>
              <View style={styles.caseHeader}>
                <View style={styles.flexColumn}>
                  <Text style={styles.childName}>{caseDetails.name}</Text>
                  <View style={styles.flexRow}>
                    <Text style={styles.caseId}>Case#: {caseDetails.id}</Text>
                    {caseDetails.officeName && <Text style={styles.officeName}>({caseDetails.officeName})</Text>}
                  </View>
                </View>
                <Image src={source} />
              </View>
            </View>
            <View style={styles.caseBody}>
              <CasePrintDetails
                status={caseDetails.status}
                openedAt={caseDetails.openedDate}
                childAtRisk={caseDetails.childIsAtRisk}
                counselor={caseDetails.currentCounselor}
                caseManager={{ name: 'Bhavna Lutchman', phone: '031 201 2059', email: 'research@childlinesa.org.za' }}
              />
              <CasePrintSection {...callerInfoSection} />
              <CasePrintSection {...childInfoSection} />
              <CasePrintSection {...incidentSection} />
              <CasePrintSection {...householdSection} />
              <CasePrintSection {...perpetratorSection} />
              <CasePrintSection {...referralsSection} />
              <CasePrintSection {...notesSection} />
              <CasePrintSummary summary={summary} />
            </View>
            <Text
              style={styles.footer}
              render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
              fixed
            />
          </Page>
        </Document>
      </PDFViewer>
    </CasePrintViewContainer>
  );
};

CasePrintView.displayName = 'CasePrintView';

export default CasePrintView;
