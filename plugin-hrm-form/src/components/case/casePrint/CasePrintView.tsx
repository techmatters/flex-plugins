/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-max-depth */
import React from 'react';
import { Page, Document, View, PDFViewer } from '@react-pdf/renderer';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { getConfig } from '../../../HrmFormPlugin';
import CasePrintSection from './CasePrintSection';
import CasePrintSummary from './CasePrintSummary';
import styles from './styles';
import { CasePrintViewContainer, HiddenText } from '../../../styles/HrmStyles';
import CasePrintDetails from './CasePrintDetails';
import type { CaseDetails } from '../../../states/case/types';
import CasePrintMultiSection from './CasePrintMultiSection';
import CasePrintNotes from './CasePrintNotes';
import CasePrintHeader from './CasePrintHeader';
import CasePrintFooter from './CasePrintFooter';
import {
  callerInfoSection,
  childInfoSection,
  contactSection,
  householdMultiSection,
  perpetratorMultiSection,
  incidentSection,
  referralsSection,
  notesSection,
  summary,
  caseManager,
  officeName,
} from './mockedData';

type OwnProps = {
  onClickClose: () => void;
  caseDetails: CaseDetails;
};
type Props = OwnProps;

const CasePrintView: React.FC<Props> = ({ onClickClose, caseDetails }) => {
  const { helplineLogoSource } = getConfig();

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
            <CasePrintHeader
              id={caseDetails.id}
              firstName={caseDetails.name.firstName}
              lastName={caseDetails.name.lastName}
              officeName={officeName}
              logoSource={helplineLogoSource}
            />
            <View>
              <CasePrintDetails
                status={caseDetails.status}
                openedDate={caseDetails.openedDate}
                lastUpdatedDate={caseDetails.lastUpdatedDate}
                followUpDate={caseDetails.followUpDate}
                childIsAtRisk={caseDetails.childIsAtRisk}
                counselor={caseDetails.caseCounselor}
                caseManager={caseManager}
                categories={caseDetails.categories}
                definitionVersion={caseDetails.definitionVersion}
              />
              <CasePrintSection {...callerInfoSection} />
              <CasePrintSection {...childInfoSection} />
              <CasePrintSection {...contactSection} />
              <CasePrintMultiSection {...householdMultiSection} />
              <CasePrintMultiSection {...perpetratorMultiSection} />
              <CasePrintSection {...incidentSection} />
              <CasePrintSection {...referralsSection} />
              <CasePrintNotes {...notesSection} />
              <CasePrintSummary summary={summary} />
            </View>
            <CasePrintFooter />
          </Page>
        </Document>
      </PDFViewer>
    </CasePrintViewContainer>
  );
};

CasePrintView.displayName = 'CasePrintView';

export default CasePrintView;
