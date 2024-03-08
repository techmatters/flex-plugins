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
/* eslint-disable react/jsx-max-depth */
import React, { useEffect, useState } from 'react';
import { Document, Page, PDFViewer, View } from '@react-pdf/renderer';
import { CircularProgress } from '@material-ui/core';
import { callTypes, DefinitionVersion, HelplineEntry } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';

import CasePrintSection from './CasePrintSection';
import CasePrintSummary from './CasePrintSummary';
import styles, { useThaiFontFamily } from './styles';
import { CasePrintViewSpinner } from '../../../styles';
import CasePrintDetails from './CasePrintDetails';
import CasePrintMultiSection from './CasePrintMultiSection';
import CasePrintNotes from './CasePrintNotes';
import CasePrintHeader from './CasePrintHeader';
import CasePrintFooter from './CasePrintFooter';
import CasePrintCSAMReports from './CasePrintCSAMReports';
import { getImageAsString, ImageSource } from './images';
import { getHrmConfig } from '../../../hrmConfig';
import NavigableContainer from '../../NavigableContainer';
import { Case, Contact, CustomITask, StandaloneITask } from '../../../types/types';
import { TimelineActivity } from '../../../states/case/types';

type OwnProps = {
  onClickClose: () => void;
  connectedCase: Case;
  definitionVersion: DefinitionVersion;
  counselorsHash: { [sid: string]: string };
  task: CustomITask | StandaloneITask;
  office: HelplineEntry | undefined;
  contactTimeline: TimelineActivity<Contact>[];
};
type Props = OwnProps;

const CasePrintView: React.FC<Props> = ({
  onClickClose,
  connectedCase,
  definitionVersion,
  counselorsHash,
  task,
  office,
  contactTimeline,
}) => {
  const { pdfImagesSource } = getHrmConfig();

  const logoSource = `${pdfImagesSource}/helpline-logo.png`;
  const chkOnSource = `${pdfImagesSource}/chk_1.png`;
  const chkOffSource = `${pdfImagesSource}/chk_0.png`;

  const [loading, setLoading] = useState<boolean>(true);
  const [logoBlob, setLogoBlob] = useState<string>(null);
  const [chkOnBlob, setChkOnBlob] = useState<string>(null);
  const [chkOffBlob, setChkOffBlob] = useState<string>(null);

  const { incident, referral, household, perpetrator, note } = connectedCase?.sections ?? {};

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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (definitionVersion.layoutVersion.thaiCharacterPdfSupport) useThaiFontFamily();
  const contact = connectedCase.connectedContacts?.[0];
  const printedFollowUpDate = connectedCase.info.followUpDate
    ? parseISO(connectedCase.info.followUpDate).toLocaleDateString()
    : '';

  return (
    <NavigableContainer task={task} onGoBack={onClickClose}>
      {loading ? (
        <CasePrintViewSpinner>
          <CircularProgress size={50} />
        </CasePrintViewSpinner>
      ) : (
        <PDFViewer style={{ height: '100%' }}>
          <Document>
            <Page size="A4" style={styles.page}>
              <CasePrintHeader
                id={connectedCase.id}
                contactIdentifier={connectedCase.label}
                officeName={office?.label}
                logoBlob={logoBlob}
              />
              <View>
                <CasePrintDetails
                  status={connectedCase.status}
                  openedDate={parseISO(connectedCase.createdAt).toLocaleDateString()}
                  lastUpdatedDate={parseISO(connectedCase.updatedAt).toLocaleDateString()}
                  followUpDate={printedFollowUpDate}
                  childIsAtRisk={connectedCase.info.childIsAtRisk}
                  counselor={counselorsHash[connectedCase.twilioWorkerId]}
                  categories={connectedCase.categories}
                  caseManager={office?.manager}
                  chkOnBlob={chkOnBlob}
                  chkOffBlob={chkOffBlob}
                  definitionVersion={definitionVersion}
                />
                {contactTimeline.map(({ activity }, idx) => {
                  const sectionNameTemplateValues = {
                    sectionNo: (idx + 1).toString(),
                    sectionCount: contactTimeline.length.toString(),
                  };
                  return activity.rawJson.callType === callTypes.caller ? (
                    <View>
                      <CasePrintSection
                        sectionNameTemplateCode="SectionName-CallerInformation"
                        sectionNameTemplateValues={sectionNameTemplateValues}
                        definitions={[
                          ...definitionVersion.tabbedForms.CaseInformationTab.filter(definition => {
                            // eslint-disable-next-line
                          return definition['highlightedAtCasePrint'] ? definition : null;
                          }),
                          ...definitionVersion.tabbedForms.CallerInformationTab,
                        ]}
                        values={{
                          ...contact?.rawJson?.caseInformation,
                          ...contact?.rawJson?.callerInformation,
                        }}
                      />
                      <CasePrintSection
                        sectionNameTemplateCode="SectionName-ChildInformation"
                        sectionNameTemplateValues={sectionNameTemplateValues}
                        definitions={definitionVersion.tabbedForms.ChildInformationTab}
                        values={contact?.rawJson?.childInformation}
                      />
                    </View>
                  ) : (
                    <CasePrintSection
                      sectionNameTemplateCode="SectionName-ChildInformation"
                      sectionNameTemplateValues={sectionNameTemplateValues}
                      definitions={[
                        ...definitionVersion.tabbedForms.CaseInformationTab.filter(definition => {
                          // eslint-disable-next-line
                        return definition['highlightedAtCasePrint'] ? definition : null;
                        }),
                        ...definitionVersion.tabbedForms.ChildInformationTab,
                      ]}
                      values={{
                        ...contact?.rawJson?.caseInformation,
                        ...contact?.rawJson?.childInformation,
                      }}
                    />
                  );
                })}
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-HouseholdMember"
                  definitions={definitionVersion.caseForms.HouseholdForm}
                  values={household}
                />
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-Perpetrator"
                  definitions={definitionVersion.caseForms.PerpetratorForm}
                  values={perpetrator}
                />
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-Incident"
                  definitions={definitionVersion.caseForms.IncidentForm}
                  values={incident}
                />
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-Referral"
                  definitions={definitionVersion.caseForms.ReferralForm}
                  values={referral}
                />
                <CasePrintNotes notes={note} counselorsHash={counselorsHash} />
                <CasePrintSummary summary={connectedCase.info.summary} />
                <CasePrintCSAMReports csamReports={contact?.csamReports} />
              </View>
              <CasePrintFooter />
            </Page>
          </Document>
        </PDFViewer>
      )}
    </NavigableContainer>
  );
};

CasePrintView.displayName = 'CasePrintView';

export default CasePrintView;
