/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-max-depth */
import React, { useState, useEffect } from 'react';
import { Page, Document, View, PDFViewer } from '@react-pdf/renderer';
import { Template, Strings } from '@twilio/flex-ui';
import { ButtonBase, CircularProgress } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { DefinitionVersion, FormDefinition, callTypes } from 'hrm-form-definitions';

import { getConfig } from '../../../HrmFormPlugin';
import CasePrintSection from './CasePrintSection';
import CasePrintSummary from './CasePrintSummary';
import styles from './styles';
import { CasePrintViewContainer, CasePrintViewSpinner, HiddenText } from '../../../styles/HrmStyles';
import CasePrintDetails from './CasePrintDetails';
import type { CaseDetails } from '../../../states/case/types';
import CasePrintMultiSection from './CasePrintMultiSection';
import CasePrintNotes from './CasePrintNotes';
import CasePrintHeader from './CasePrintHeader';
import CasePrintFooter from './CasePrintFooter';
// import CasePrintContact from './CasePrintContact'; // Removed by ZA request, could be useful for other helplines.
import { getImageAsString, ImageSource } from './helpers';
import { ContactRawJson } from '../../../types/types';

type OwnProps = {
  onClickClose: () => void;
  caseDetails: CaseDetails;
  definitionVersion: DefinitionVersion;
  counselorsHash: { [sid: string]: string };
};
type Props = OwnProps;

const CasePrintView: React.FC<Props> = ({ onClickClose, caseDetails, definitionVersion, counselorsHash }) => {
  const { pdfImagesSource, strings } = getConfig();

  const logoSource = `${pdfImagesSource}/helpline-logo.png`;
  const chkOnSource = `${pdfImagesSource}/chk_1.png`;
  const chkOffSource = `${pdfImagesSource}/chk_0.png`;

  const [loading, setLoading] = useState<boolean>(true);
  const [logoBlob, setLogoBlob] = useState<string>(null);
  const [chkOnBlob, setChkOnBlob] = useState<string>(null);
  const [chkOffBlob, setChkOffBlob] = useState<string>(null);

  /*
   * The purpose of this effect is to load all the images at once, to avoid re-renders in PDFViewer that leads to issues
   * https://stackoverflow.com/questions/60614940/unhandled-rejection-typeerror-nbind-externallistnum-dereference-is-not-a-f
   */
  useEffect(() => {
    const imageSources: ImageSource[] = [
      {
        url: logoSource,
        setStateCallback: setLogoBlob,
      },
      {
        url: chkOnSource,
        setStateCallback: setChkOnBlob,
      },
      {
        url: chkOffSource,
        setStateCallback: setChkOffBlob,
      },
    ];

    /**
     * Loads the collection of image BLOBs in memory (using setState callbacks)
     * @param imgSources ImageSources (url and callbacks)
     */
    async function loadImagesInMemory(imgSources: ImageSource[]) {
      const getImageBlob = async (imgSrc: ImageSource) => {
        const blob = await getImageAsString(imgSrc.url);
        imgSrc.setStateCallback(blob.toString());
      };

      // Awaits until all promises are resolved (all images were loaded)
      await Promise.all(imgSources.map(src => getImageBlob(src)));
      setLoading(false);
    }

    loadImagesInMemory(imageSources);
  }, [logoSource, chkOnSource, chkOffSource]);

  const caseInfoDefinitions = [...definitionVersion.tabbedForms.CaseInformationTab].filter(definition => {
    // eslint-disable-next-line
    return definition['highlightedAtCasePrint'] ? definition : null;
  });

  const addExtraValues = (caseInformation: ContactRawJson['caseInformation']) => {
    return {
      keepConfidential: Boolean(caseInformation?.keepConfidential),
      okForCaseWorkerToCall: caseInformation?.okForCaseWorkerToCall,
      callSummary: caseInformation?.callSummary,
      repeatCaller: caseInformation?.repeatCaller,
      actionTaken: caseInformation?.actionTaken,
      howDidYouKnowAboutOurLine: caseInformation?.howDidYouKnowAboutOurLine,
      didYouDiscussRightsWithTheChild: caseInformation?.didYouDiscussRightsWithTheChild,
      didTheChildFeelWeSolvedTheirProblem: caseInformation?.didTheChildFeelWeSolvedTheirProblem,
      wouldTheChildRecommendUsToAFriend: caseInformation?.wouldTheChildRecommendUsToAFriend,
    };
  };

  return (
    <CasePrintViewContainer>
      <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }} data-testid="CasePrint-CloseCross">
        <HiddenText>
          <Template code="Case-CloseButton" />
        </HiddenText>
        <Close />
      </ButtonBase>
      {loading ? (
        <CasePrintViewSpinner>
          <CircularProgress size={50} />
        </CasePrintViewSpinner>
      ) : (
        <PDFViewer style={{ height: '100%' }}>
          <Document>
            <Page size="A4" style={styles.page}>
              <CasePrintHeader
                id={caseDetails.id}
                firstName={caseDetails.name.firstName}
                lastName={caseDetails.name.lastName}
                officeName={caseDetails.office?.label}
                logoBlob={logoBlob}
              />
              <View>
                <CasePrintDetails
                  status={caseDetails.status}
                  openedDate={caseDetails.openedDate}
                  lastUpdatedDate={caseDetails.lastUpdatedDate}
                  followUpDate={caseDetails.followUpPrintedDate}
                  childIsAtRisk={caseDetails.childIsAtRisk}
                  counselor={caseDetails.caseCounselor}
                  categories={caseDetails.categories}
                  version={caseDetails.version}
                  caseManager={caseDetails.office?.manager}
                  chkOnBlob={chkOnBlob}
                  chkOffBlob={chkOffBlob}
                />
                {caseDetails.contact?.rawJson?.callType === callTypes.caller ? (
                  <View>
                    <CasePrintSection
                      sectionName={strings['SectionName-CallerInformation']}
                      definitions={[...caseInfoDefinitions, ...definitionVersion.tabbedForms.CallerInformationTab]}
                      values={{
                        ...addExtraValues(caseDetails.contact?.rawJson?.caseInformation),
                        ...caseDetails.contact?.rawJson?.callerInformation,
                      }}
                      unNestInfo={true}
                    />
                    <CasePrintSection
                      sectionName={strings['SectionName-ChildInformation']}
                      definitions={definitionVersion.tabbedForms.ChildInformationTab}
                      values={caseDetails.contact?.rawJson?.childInformation}
                      unNestInfo={true}
                    />
                  </View>
                ) : (
                  <CasePrintSection
                    sectionName={strings['SectionName-ChildInformation']}
                    definitions={[...caseInfoDefinitions, ...definitionVersion.tabbedForms.ChildInformationTab]}
                    values={{
                      ...addExtraValues(caseDetails.contact?.rawJson?.caseInformation),
                      ...caseDetails.contact?.rawJson?.childInformation,
                    }}
                    unNestInfo={true}
                  />
                )}
                {/* // Removed by ZA request, could be useful for other helplines.
                <CasePrintContact
                  sectionName={strings['SectionName-Contact']}
                  contact={caseDetails.contact}
                  counselor={caseDetails.caseCounselor}
                /> */}
                <CasePrintMultiSection
                  sectionName={strings['SectionName-HouseholdMember']}
                  sectionKey="household"
                  definitions={definitionVersion.caseForms.HouseholdForm}
                  values={caseDetails.households}
                />
                <CasePrintMultiSection
                  sectionName={strings['SectionName-Perpetrator']}
                  sectionKey="perpetrator"
                  definitions={definitionVersion.caseForms.PerpetratorForm}
                  values={caseDetails.perpetrators}
                />
                <CasePrintMultiSection
                  sectionName={strings['SectionName-Incident']}
                  definitions={definitionVersion.caseForms.IncidentForm}
                  sectionKey="incident"
                  values={caseDetails.incidents}
                />
                <CasePrintMultiSection
                  sectionName={strings['SectionName-Referral']}
                  definitions={definitionVersion.caseForms.ReferralForm}
                  sectionKey="referral"
                  values={caseDetails.referrals}
                />
                <CasePrintNotes notes={caseDetails.notes} counselorsHash={counselorsHash} />
                <CasePrintSummary summary={caseDetails.summary} />
              </View>
              <CasePrintFooter />
            </Page>
          </Document>
        </PDFViewer>
      )}
    </CasePrintViewContainer>
  );
};

CasePrintView.displayName = 'CasePrintView';

export default CasePrintView;
