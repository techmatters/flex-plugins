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
import { callTypes } from 'hrm-form-definitions';
import { parseISO } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';

import CasePrintSection from './CasePrintSection';
import CasePrintSummary from './CasePrintSummary';
import styles, { useThaiFontFamily } from './styles';
import { CasePrintViewSpinner } from '../../../styles';
import CasePrintDetails from './CasePrintDetails';
import CasePrintMultiSection from './CasePrintMultiSection';
import CasePrintSectionsList from './CasePrintSectionsList';
import CasePrintHeader from './CasePrintHeader';
import CasePrintFooter from './CasePrintFooter';
import CasePrintCSAMReports from './CasePrintCSAMReports';
import { getImageAsString, ImageSource } from './images';
import { getHrmConfig } from '../../../hrmConfig';
import NavigableContainer from '../../NavigableContainer';
import { Contact, CustomITask, StandaloneITask } from '../../../types/types';
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

const CasePrintView: React.FC<OwnProps> = ({ task }) => {
  const { connectedCase, sections } = useSelector((state: RootState) =>
    selectCurrentRouteCaseState(state, task.taskSid),
  );
  const office = useSelector((state: RootState) => selectCaseHelplineData(state, connectedCase?.id));
  const definitionVersion = useSelector((state: RootState) => selectDefinitionVersionForCase(state, connectedCase));
  const counselorsHash = useSelector(selectCounselorsHash);
  const contactTimeline = useSelector(
    (state: RootState) =>
      selectTimeline(state, connectedCase?.id, 'print-contacts', {
        offset: 0,
        limit: MAX_PRINTOUT_CONTACTS,
      }) as TimelineActivity<Contact>[],
  );
  const sectionTypeNames = Object.keys(definitionVersion.caseSectionTypes);

  const sectionEntries = useSelector((state: RootState) =>
    sectionTypeNames.map(
      sectionName =>
        [
          sectionName,
          selectTimeline(state, connectedCase.id, sectionName, { offset: 0, limit: MAX_SECTIONS })?.map(
            ({ activity }) => activity as FullCaseSection,
          ),
        ] as const,
    ),
  );

  const sectionIdCsvsEntries = sectionTypeNames.map(
    sectionName => [sectionName, Object.keys(sections?.[sectionName] ?? {}).join(',')], // Used to trigger re-fetch of sections
  );
  const sectionTimelines = Object.fromEntries(sectionEntries);
  const sectionIdCsvs = Object.fromEntries(sectionIdCsvsEntries);

  const dispatch = useDispatch();

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
      dispatch(
        newGetTimelineAsyncAction(connectedCase.id, 'print-contacts', [], true, {
          offset: 0,
          limit: MAX_PRINTOUT_CONTACTS,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedCase.id, Boolean(contactTimeline)]);

  for (const sectionType of sectionTypeNames) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(
      () => {
        dispatch(
          newGetTimelineAsyncAction(connectedCase.id, sectionType, [sectionType], false, {
            offset: 0,
            limit: MAX_SECTIONS,
          }),
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [connectedCase.id, sectionIdCsvs[sectionType]],
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

  const orderedListSections = Object.entries(definitionVersion.caseSectionTypes)
    .filter(([sectionType]) => sectionType !== 'document')
    .map(([sectionType]) => ({
      sectionType,
      layout: definitionVersion.layoutVersion.case.sectionTypes[sectionType] ?? {},
    }))
    .sort(
      ({ layout: layout1 }, { layout: layout2 }) =>
        (layout1.printOrder ?? Number.MAX_SAFE_INTEGER) - (layout2.printOrder ?? Number.MAX_SAFE_INTEGER),
    );

  return (
    <NavigableContainer task={task} onGoBack={() => dispatch(RoutingActions.newGoBackAction(task.taskSid))}>
      {loading || !sectionTypeNames.every(sectionName => sectionTimelines[sectionName]) || !contactTimeline ? (
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
                {orderedListSections.map(({ sectionType }) =>
                  sectionType === 'note' ? (
                    <CasePrintSectionsList
                      key={sectionType}
                      sections={sectionTimelines[sectionType]}
                      counselorsHash={counselorsHash}
                      formDefinition={definitionVersion}
                    />
                  ) : (
                    <CasePrintMultiSection
                      key={sectionType}
                      sectionType={sectionType}
                      definition={definitionVersion}
                      sections={sectionTimelines[sectionType]}
                    />
                  ),
                )}

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

export default CasePrintView;
