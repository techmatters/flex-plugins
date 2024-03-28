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
import React, { Dispatch, useEffect, useState } from 'react';
import { Document, Page, PDFViewer, View } from '@react-pdf/renderer';
import { CircularProgress } from '@material-ui/core';
import { callTypes } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';
import { connect, ConnectedProps } from 'react-redux';

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
import { Case, Contact, CustomITask, StandaloneITask, WellKnownCaseSection } from '../../../types/types';
import { TimelineActivity } from '../../../states/case/types';
import { RootState } from '../../../states';
import selectCurrentRouteCaseState from '../../../states/case/selectCurrentRouteCase';
import { newGetTimelineAsyncAction, selectTimeline } from '../../../states/case/timeline';
import { selectDefinitionVersionForCase } from '../../../states/configuration/selectDefinitions';
import { selectCounselorsHash } from '../../../states/configuration/selectCounselorsHash';
import selectCaseHelplineData from '../../../states/case/selectCaseHelplineData';
import * as RoutingActions from '../../../states/routing/actions';
import { FullCaseSection } from '../../../services/caseSectionService';
import { contactLabelFromHrmContact } from '../../../states/contacts/contactIdentifier';

type OwnProps = {
  task: CustomITask | StandaloneITask;
};

const MAX_SECTIONS = 100;
const MAX_PRINTOUT_CONTACTS = 100;
const SECTION_NAMES = ['perpetrator', 'incident', 'referral', 'household', 'note'] as const;

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const { connectedCase } = selectCurrentRouteCaseState(state, task.taskSid);
  const sectionEntries = SECTION_NAMES.map(
    sectionName =>
      [
        sectionName,
        selectTimeline(state, connectedCase.id, sectionName, { offset: 0, limit: MAX_SECTIONS })?.map(
          ({ activity }) => activity as FullCaseSection,
        ),
      ] as const,
  );
  return {
    office: selectCaseHelplineData(state, connectedCase?.id),
    definitionVersion: selectDefinitionVersionForCase(state, connectedCase),
    counselorsHash: selectCounselorsHash(state),
    connectedCase,
    sectionTimelines: Object.fromEntries(sectionEntries),
    contactTimeline: selectTimeline(state, connectedCase?.id, 'print-contacts', {
      offset: 0,
      limit: MAX_PRINTOUT_CONTACTS,
    }) as TimelineActivity<Contact>[],
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: OwnProps) => {
  return {
    goBack: () => dispatch(RoutingActions.newGoBackAction(task.taskSid)),
    loadSectionTimeline: (caseId: Case['id'], sectionType: WellKnownCaseSection) =>
      dispatch(
        newGetTimelineAsyncAction(caseId, sectionType, [sectionType], false, { offset: 0, limit: MAX_SECTIONS }),
      ),
    loadContactTimeline: (caseId: Case['id']) =>
      dispatch(
        newGetTimelineAsyncAction(caseId, 'print-contacts', [], true, { offset: 0, limit: MAX_PRINTOUT_CONTACTS }),
      ),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = OwnProps & ConnectedProps<typeof connector>;

const CasePrintView: React.FC<Props> = ({
  goBack,
  connectedCase,
  definitionVersion,
  counselorsHash,
  task,
  office,
  contactTimeline,
  sectionTimelines,
  loadSectionTimeline,
  loadContactTimeline,
}) => {
  const { pdfImagesSource } = getHrmConfig();

  const logoSource = `${pdfImagesSource}/helpline-logo.png`;
  const chkOnSource = `${pdfImagesSource}/chk_1.png`;
  const chkOffSource = `${pdfImagesSource}/chk_0.png`;

  const [loading, setLoading] = useState<boolean>(true);
  const [logoBlob, setLogoBlob] = useState<string>(null);
  const [chkOnBlob, setChkOnBlob] = useState<string>(null);
  const [chkOffBlob, setChkOffBlob] = useState<string>(null);

  useEffect(() => {
    if (!contactTimeline) {
      loadContactTimeline(connectedCase.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedCase.id, Boolean(contactTimeline), loadContactTimeline]);

  for (const sectionName of SECTION_NAMES) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(
      () => {
        if (!sectionTimelines[sectionName]) {
          loadSectionTimeline(connectedCase.id, sectionName);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        connectedCase.id,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        Boolean(sectionTimelines[sectionName]),
      ],
    );
  }
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
  const printedFollowUpDate = connectedCase.info.followUpDate
    ? parseISO(connectedCase.info.followUpDate).toLocaleDateString()
    : '';

  const caseLabel = contactLabelFromHrmContact(definitionVersion, connectedCase.firstContact);
  const allCsamReports = contactTimeline?.flatMap(({ activity }) => activity?.csamReports ?? []) ?? [];

  return (
    <NavigableContainer task={task} onGoBack={goBack}>
      {loading || !SECTION_NAMES.every(sectionName => sectionTimelines[sectionName]) || !contactTimeline ? (
        <CasePrintViewSpinner>
          <CircularProgress size={50} />
        </CasePrintViewSpinner>
      ) : (
        <PDFViewer style={{ height: '100%' }}>
          <Document>
            <Page size="A4" style={styles.page}>
              <CasePrintHeader
                id={connectedCase.id}
                contactIdentifier={caseLabel}
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
                          ...activity?.rawJson?.caseInformation,
                          ...activity?.rawJson?.callerInformation,
                        }}
                      />
                      <CasePrintSection
                        sectionNameTemplateCode="SectionName-ChildInformation"
                        sectionNameTemplateValues={sectionNameTemplateValues}
                        definitions={definitionVersion.tabbedForms.ChildInformationTab}
                        values={activity?.rawJson?.childInformation}
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
                        ...activity?.rawJson?.caseInformation,
                        ...activity?.rawJson?.childInformation,
                      }}
                    />
                  );
                })}
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-HouseholdMember"
                  definitions={definitionVersion.caseForms.HouseholdForm}
                  values={sectionTimelines.household}
                />
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-Perpetrator"
                  definitions={definitionVersion.caseForms.PerpetratorForm}
                  values={sectionTimelines.perpetrator}
                />
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-Incident"
                  definitions={definitionVersion.caseForms.IncidentForm}
                  values={sectionTimelines.incident}
                />
                <CasePrintMultiSection
                  sectionNameTemplateCode="SectionName-Referral"
                  definitions={definitionVersion.caseForms.ReferralForm}
                  values={sectionTimelines.referral}
                />
                <CasePrintNotes notes={sectionTimelines.note} counselorsHash={counselorsHash} />
                <CasePrintSummary summary={connectedCase.info.summary} />
                <CasePrintCSAMReports csamReports={allCsamReports} />
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

export default connector(CasePrintView);
