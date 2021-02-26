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
// import source from '../../../resources/ZA_childline_logo.jpg';
import CasePrintDetails from './CasePrintDetails';
import type { CaseDetails } from '../../../states/case/types';
import CasePrintMultiSection from './CasePrintMultiSection';
import CasePrintNotes from './CasePrintNotes';

type OwnProps = {
  onClickClose: () => void;
  caseDetails: CaseDetails;
};
type Props = OwnProps;

const CasePrintView: React.FC<Props> = ({ onClickClose, caseDetails }) => {
  const callerInfoSection = {
    sectionName: 'Caller Information',
    fieldValues: [
      { label: 'First Name', value: 'Ross' },
      { label: 'Last Name', value: 'Keller' },
      { label: 'Address', value: '------' },
      { label: 'Province', value: '------' },
      { label: 'Municipality', value: '------' },
      { label: 'District', value: '------' },
      { label: 'Contact Number', value: '031 201 1111' },
      { label: 'Relationship to Child', value: 'Teacher' },
      { label: 'Gender', value: 'Boy' },
      { label: 'Age', value: '12' },
      { label: 'Language', value: 'English' },
      { label: 'Race', value: 'Indian' },
    ],
  };

  const childInfoSection = {
    sectionName: 'Child Information',
    fieldValues: [
      { label: 'First Name', value: caseDetails.name.firstName },
      { label: 'Last Name', value: caseDetails.name.lastName },
      { label: 'Address', value: '------' },
      { label: 'Province', value: '------' },
      { label: 'Municipality', value: '------' },
      { label: 'District', value: '------' },
      { label: 'Contact Number', value: '------' },
      { label: 'Gender', value: 'Boy' },
      { label: 'Age', value: '12' },
      { label: 'Language', value: 'English' },
      { label: 'Race', value: 'Indian' },
      { label: 'School Name', value: '------' },
      { label: 'School Address', value: '------' },
      { label: 'Educator', value: '------' },
      { label: 'Grade Level', value: '8' },
      { label: 'Living Situation', value: 'Unknown' },
      { label: 'Region', value: '------' },
      { label: 'Child HIV Positive', value: '------' },
      { label: 'Child in conflict with the law', value: '------' },
      { label: 'Child in detention', value: '------' },
      { label: 'Child member of an ethnic or racial minority', value: 'No' },
      { label: 'Child on the move or in migration', value: '------' },
      { label: 'Child with disability', value: 'Yes' },
      { label: 'LGBTQI+ / SOEGIS Child', value: 'Unknown' },
    ],
  };

  const contactSection = {
    sectionName: 'Contact',
    fieldValues: [
      {
        label: 'Contact Summary',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam convallis magna a suscipit scelerisque. Vestibulum molestie mi ipsum, eu elementum augue malesuada at.',
      },
      { label: 'Channel', value: 'SMS' },
      { label: 'Phone Number', value: '+12066127815' },
      { label: 'Converstion Duration', value: '21m 30s' },
      { label: 'Counsellor', value: 'Jana Kleitsch' },
      { label: 'Date/Time', value: 'Feb 3 2021, 10:30 pm' },
      { label: 'Repeat Caller?', value: 'Unknown' },
      { label: 'Referred To', value: 'Unknown' },
      { label: 'How did the child hear about us?', value: 'Unknown' },
      { label: 'Keep confidential?', value: 'Yes' },
      { label: 'OK for case worker to call?', value: 'Unknown' },
      { label: 'Did you discuss right with the child?', value: 'Unknown' },
      { label: 'Did the child feel we solved their problem?', value: 'Unknown' },
      { label: 'Would the child recommend us to a friend?', value: 'Unknown' },
    ],
  };

  const incidentSection = {
    sectionName: 'Incidents',
    fieldValues: [
      { label: 'Date', value: '11/03/2020' },
      { label: 'Duration', value: 'Ongoing' },
      { label: 'Location', value: 'Home' },
      { label: 'Is caregiver aware?', value: 'No' },
      { label: 'Was this incident witnessed by anyone', value: 'No' },
    ],
  };

  const householdMultiSection = {
    sectionName: 'Household Members',
    sectionValues: [
      {
        key: 1,
        fieldValues: [
          { label: 'First Name', value: 'John' },
          { label: 'Last Name', value: 'McKinley' },
          { label: 'Address', value: '------' },
          { label: 'Province', value: '------' },
          { label: 'Municipality', value: '------' },
          { label: 'District', value: '------' },
          { label: 'Contact Number', value: '031 201 1111' },
          { label: 'Relationship to Child', value: 'Parent' },
          { label: 'Gender', value: 'Boy' },
          { label: 'Age', value: '>25' },
          { label: 'Language', value: 'English' },
        ],
      },
      {
        key: 2,
        fieldValues: [
          { label: 'First Name', value: 'Janice' },
          { label: 'Last Name', value: 'McKinley' },
          { label: 'Address', value: '------' },
          { label: 'Province', value: '------' },
          { label: 'Municipality', value: '------' },
          { label: 'District', value: '------' },
          { label: 'Contact Number', value: '031 201 1111' },
          { label: 'Relationship to Child', value: 'Parent' },
          { label: 'Gender', value: 'Girl' },
          { label: 'Age', value: '>25' },
          { label: 'Language', value: 'English' },
        ],
      },
    ],
  };

  const perpetratorMultiSection = {
    sectionName: 'Perpetrator',
    sectionValues: [
      {
        key: 1,
        fieldValues: [
          { label: 'First Name', value: 'Janice' },
          { label: 'Last Name', value: 'McKinley' },
          { label: 'Address', value: '------' },
          { label: 'Province', value: '------' },
          { label: 'Municipality', value: '------' },
          { label: 'District', value: '------' },
          { label: 'Contact Number', value: '031 201 1111' },
          { label: 'Relationship to Child', value: 'Neighbor' },
          { label: 'Gender', value: 'Girl' },
          { label: 'Age', value: '>25' },
          { label: 'Language', value: 'English' },
        ],
      },
      {
        key: 2,
        fieldValues: [
          { label: 'First Name', value: 'Unknown' },
          { label: 'Last Name', value: 'Unknown' },
          { label: 'Address', value: '------' },
          { label: 'Province', value: '------' },
          { label: 'Municipality', value: '------' },
          { label: 'District', value: '------' },
          { label: 'Contact Number', value: '031 201 1111' },
          { label: 'Relationship to Child', value: 'Neighbor' },
          { label: 'Gender', value: 'Girl' },
          { label: 'Age', value: '>25' },
          { label: 'Language', value: 'English' },
        ],
      },
    ],
  };

  const referralsSection = {
    sectionName: 'Referrals',
    fieldValues: [
      { label: 'Added by', value: 'John Doe' },
      { label: 'Date', value: '1/3/2021' },
      { label: 'Recommendation', value: 'State Agency 1' },
      { label: 'Comments', value: 'Lorem ipsum dolor sit amet' },
    ],
  };

  const notesSection = {
    notes: [
      {
        counselor: 'Some Counselor',
        date: '11/03/2020',
        note:
          'Sed tincidunt odio eget nisi semper euismod. Vestibulum commodo vulputate sem, vel finibus augue. Proin ultricies faucibus urna, cursus consequat augue volutpat at. Mauris in tellus neque. Sed finibus rhoncus odio bibendum pellentesque. Etiam quam ex, ultrices nec efficitur eu, semper ut nulla. Maecenas libero arcu, molestie et finibus quis, efficitur ut turpis. Fusce iaculis mollis rutrum.',
      },
      {
        counselor: 'Some Counselor',
        date: '15/03/2020',
        note:
          'Proin arcu felis, rhoncus eget pretium id, porta sit amet elit. Quisque sed sem convallis mi vehicula tristique. Cras laoreet cursus odio, vitae vestibulum odio blandit lacinia.',
      },
    ],
  };

  const summary =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam convallis magna a suscipit scelerisque. Vestibulum molestie mi ipsum, eu elementum augue malesuada at. Phasellus ac nibh in nibh ullamcorper luctus. Fusce tristique dui nulla. In lacinia sem a mi congue, eget tincidunt risus euismod. Aliquam euismod metus eu augue ultrices, non sagittis tellus aliquam. Phasellus non lacus et augue convallis lacinia et ac nisl. Nulla interdum lectus eget nulla pulvinar pretium. Aenean laoreet enim vitae diam tristique, dapibus suscipit ligula placerat. Maecenas pellentesque egestas metus sit amet ornare. Proin vel dui nulla. Nam fringilla venenatis justo in porta.';

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
                  <Text style={styles.childName}>{`${caseDetails.name.firstName} ${caseDetails.name.lastName}`}</Text>
                  <View style={styles.flexRow}>
                    <Text style={styles.caseId}>Case#: {caseDetails.id}</Text>
                    {caseDetails.officeName && <Text style={styles.officeName}>({caseDetails.officeName})</Text>}
                  </View>
                </View>
                {/* <Image src={source} /> */}
              </View>
            </View>
            <View style={styles.caseBody}>
              <CasePrintDetails
                status={caseDetails.status}
                openedDate={caseDetails.openedDate}
                lastUpdatedDate={caseDetails.lastUpdatedDate}
                followUpDate={caseDetails.followUpDate}
                childIsAtRisk={caseDetails.childIsAtRisk}
                counselor={caseDetails.currentCounselor}
                caseManager={{ name: 'Bhavna Lutchman', phone: '031 201 2059', email: 'research@childlinesa.org.za' }}
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
