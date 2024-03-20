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
import React, { Dispatch } from 'react';
import { Template } from '@twilio/flex-ui';
import { connect, ConnectedProps } from 'react-redux';
import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseContainer, CaseDetailsBorder, ViewButton } from './styles';
import { BottomButtonBar, Box, SaveAndEndButton, StyledNextStepButton } from '../../styles';
import CaseDetails from './CaseDetails';
import Timeline from './timeline/Timeline';
import CaseSection from './CaseSection';
import { PermissionActions, PermissionActionType } from '../../permissions';
import {
  AppRoutes,
  CaseItemAction,
  CaseRoute,
  CaseSectionSubroute,
  NewCaseSubroutes,
} from '../../states/routing/types';
import CaseSummary from './CaseSummary';
import { RootState } from '../../states';
import { Case, Contact, CustomITask, StandaloneITask } from '../../types/types';
import * as RoutingActions from '../../states/routing/actions';
import { newCloseModalAction } from '../../states/routing/actions';
import InformationRow from './InformationRow';
import IncidentInformationRow from './IncidentInformationRow';
import DocumentInformationRow from './DocumentInformationRow';
import { getAseloFeatureFlags } from '../../hrmConfig';
import NavigableContainer from '../NavigableContainer';
import { isStandaloneITask } from './Case';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import asyncDispatch from '../../states/asyncDispatch';
import { connectToCaseAsyncAction } from '../../states/contacts/saveContact';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import CaseCreatedBanner from '../caseMergingBanners/CaseCreatedBanner';
import AddToCaseBanner from '../caseMergingBanners/AddToCaseBanner';
import { selectCaseActivityCount } from '../../states/case/timeline';
import { CaseSection as CaseSectionType } from '../../services/caseSectionService';
import { selectDefinitionVersionForCase } from '../../states/configuration/selectDefinitions';
import selectCaseHelplineData from '../../states/case/selectCaseHelplineData';
import { selectCounselorName } from '../../states/configuration/selectCounselorsHash';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import { selectContactsByCaseIdInCreatedOrder } from '../../states/contacts/selectContactByCaseId';

export type CaseHomeProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  handleClose?: () => void;
  handleSaveAndEnd: () => void;
  handlePrintCase: () => void;
  can: (action: PermissionActionType) => boolean;
};

const MAX_ACTIVITIES_IN_TIMELINE_SECTION = 5;

const mapStateToProps = (state: RootState, { task }: CaseHomeProps) => {
  const connectedCaseState = selectCurrentRouteCaseState(state, task.taskSid);
  const taskContact = isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact;
  const routing = selectCurrentTopmostRouteForTask(state, task.taskSid) as CaseRoute;
  const { connectedCase, availableStatusTransitions = [] } = connectedCaseState ?? {};
  const caseContacts = selectContactsByCaseIdInCreatedOrder(state, routing.caseId);

  const contactForLabel = caseContacts[0]?.savedContact ?? taskContact;
  const isNewContact = Boolean(taskContact && taskContact.caseId === routing.caseId && !taskContact.finalizedAt);
  const isNewCase = caseContacts.length === 1 && taskContact && taskContact.caseId === routing.caseId;
  const activityCount = routing.route === 'case' ? selectCaseActivityCount(state, routing.caseId) : 0;
  const definitionVersion = selectDefinitionVersionForCase(state, connectedCase);
  const counselor = selectCounselorName(state, connectedCase?.twilioWorkerId);

  return {
    isNewContact,
    isNewCase,
    connectedCase,
    availableStatusTransitions,
    taskContact,
    hasMoreActivities: activityCount > MAX_ACTIVITIES_IN_TIMELINE_SECTION,
    office: selectCaseHelplineData(state, routing.caseId),
    definitionVersion,
    counselor,
    label: contactLabelFromHrmContact(definitionVersion, contactForLabel, {
      placeholder: '',
      substituteForId: false,
    }),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: CaseHomeProps) => ({
  changeRoute: (route: AppRoutes) => dispatch(RoutingActions.changeRoute(route, task.taskSid)),
  openModal: (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, task.taskSid)),
  connectCaseToTaskContact: async (taskContact: Contact, cas: Case) =>
    asyncDispatch(dispatch)(connectToCaseAsyncAction(taskContact.id, cas.id)),
  closeModal: () => dispatch(newCloseModalAction(task.taskSid, 'tabbed-forms')),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = CaseHomeProps & ConnectedProps<typeof connector>;

const CaseHome: React.FC<Props> = ({
  definitionVersion,
  task,
  openModal,
  handlePrintCase,
  handleClose,
  handleSaveAndEnd,
  can,
  connectedCase,
  availableStatusTransitions,
  isNewContact,
  isNewCase,
  hasMoreActivities,
  office,
  counselor,
  label,
}) => {
  if (!connectedCase) return null; // narrow type before deconstructing
  const caseId = connectedCase.id;
  const {
    enable_upload_documents: enableUploadDocuments,
    enable_case_merging: enableCaseMerging,
    enable_separate_timeline_view: enableSeparateTimelineView,
  } = getAseloFeatureFlags();

  const onViewCaseItemClick = (targetSubroute: CaseSectionSubroute) => (id: string) => {
    openModal({ route: 'case', subroute: targetSubroute, action: CaseItemAction.View, id, caseId });
  };

  const onAddCaseItemClick = (targetSubroute: CaseSectionSubroute) => () => {
    openModal({ route: 'case', subroute: targetSubroute, action: CaseItemAction.Add, caseId });
  };

  const onViewFullTimelineClick = () => {
    openModal({ route: 'case', subroute: 'timeline', caseId, page: 0 });
  };

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const {
    sections,
    info: { followUpDate, childIsAtRisk },
    status,
    id,
    categories,
    createdAt,
    updatedAt,
  } = connectedCase;

  const statusLabel = definitionVersion.caseStatus[status]?.label ?? status;

  const genericSectionRenderer = (
    subroute: CaseSectionSubroute,
    addPermission: PermissionActionType,
    items: CaseSectionType[] | undefined,
    itemRowRenderer: (
      subroute: CaseSectionSubroute,
      section: CaseSectionType,
      rowIndex: number,
    ) => JSX.Element | null = (subroute, { sectionId, sectionTypeSpecificData }, index) => (
      <InformationRow
        key={`${subroute}-${index}`}
        person={sectionTypeSpecificData}
        onClickView={() => onViewCaseItemClick(subroute)(sectionId)}
      />
    ),
  ): JSX.Element => (
    <Box margin="25px 0 0 0">
      <CaseSection
        canAdd={() => can(addPermission)}
        onClickAddItem={onAddCaseItemClick(subroute)}
        // Messy, need to find a neater approach to the case section translation.
        // Will probably be reworked if & when customisable case section types are introduced.
        sectionTypeId={subroute.charAt(0).toUpperCase() + subroute.slice(1)}
      >
        <>{(items ?? []).map((item, index) => itemRowRenderer(subroute, item, index))}</>
      </CaseSection>
    </Box>
  );

  const {
    incident: incidentSections,
    perpetrator: perpetratorSections,
    household: householdSections,
    document: documentSections,
  } = sections ?? {};

  const onEditCaseSummaryClick = () => {
    openModal({ route: 'case', subroute: 'caseSummary', action: CaseItemAction.Edit, id: '', caseId });
  };

  return (
    <NavigableContainer
      titleCode={label}
      task={task}
      onGoBack={handleClose}
      onCloseModal={handleClose}
      data-testid="CaseHome-CaseDetailsComponent"
    >
      <CaseContainer>
        <AddToCaseBanner task={task} />

        {isNewCase && (
          <Box marginBottom="14px" width="100%">
            <CaseCreatedBanner caseId={caseId} task={task} />
          </Box>
        )}
        <Box marginTop="13px">
          <CaseDetails
            caseId={id}
            statusLabel={statusLabel}
            can={can}
            counselor={counselor}
            categories={categories}
            createdAt={createdAt}
            updatedAt={updatedAt}
            followUpDate={followUpDate}
            childIsAtRisk={childIsAtRisk}
            availableStatusTransitions={availableStatusTransitions}
            office={office?.label}
            handlePrintCase={handlePrintCase}
            definitionVersion={definitionVersion}
            isOrphanedCase={(connectedCase.connectedContacts ?? []).length === 0}
            editCaseSummary={onEditCaseSummaryClick}
          />
        </Box>
        <Box margin="25px 0 0 0">
          <CaseSummary task={task} />
        </Box>
        <Box margin="25px 0 0 0" style={{ textAlign: 'center' }}>
          <CaseDetailsBorder>
            <Timeline
              taskSid={task.taskSid}
              page={0}
              pageSize={enableSeparateTimelineView ? 5 : Number.MAX_SAFE_INTEGER}
              titleCode={
                hasMoreActivities && enableSeparateTimelineView ? 'Case-Timeline-RecentTitle' : 'Case-Timeline-Title'
              }
            />
            {enableSeparateTimelineView && hasMoreActivities && (
              <ViewButton style={{ marginTop: '10px' }} withDivider={false} onClick={onViewFullTimelineClick}>
                <Template code="Case-Timeline-OpenFullTimelineButton" />
              </ViewButton>
            )}
          </CaseDetailsBorder>
        </Box>
        {genericSectionRenderer(NewCaseSubroutes.Household, PermissionActions.ADD_HOUSEHOLD, householdSections)}
        {genericSectionRenderer(NewCaseSubroutes.Perpetrator, PermissionActions.ADD_PERPETRATOR, perpetratorSections)}
        {genericSectionRenderer(
          NewCaseSubroutes.Incident,
          PermissionActions.ADD_INCIDENT,
          incidentSections,
          (subroute, { sectionTypeSpecificData, sectionId }, index) => (
            <IncidentInformationRow
              key={`incident-${index}`}
              onClickView={() => onViewCaseItemClick(subroute)(sectionId)}
              definition={caseForms.IncidentForm}
              values={sectionTypeSpecificData}
              layoutDefinition={caseLayouts.incidents}
            />
          ),
        )}
        {enableUploadDocuments &&
          genericSectionRenderer(
            NewCaseSubroutes.Document,
            PermissionActions.ADD_DOCUMENT,
            documentSections,
            (subroute, item, index) => (
              <DocumentInformationRow
                key={`document-${index}`}
                caseSection={item}
                onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Document)(item.sectionId)}
              />
            ),
          )}
      </CaseContainer>
      {isNewContact && (
        <BottomButtonBar>
          {!enableCaseMerging && (
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="CaseHome-CancelButton"
                secondary="true"
                roundCorners
                onClick={handleClose}
              >
                <Template code="BottomBar-CancelNewCaseAndClose" />
              </StyledNextStepButton>
            </Box>
          )}
          <SaveAndEndButton roundCorners onClick={handleSaveAndEnd} data-testid="BottomBar-SaveCaseAndEnd">
            <Template code="BottomBar-SaveAndEnd" />
          </SaveAndEndButton>
        </BottomButtonBar>
      )}
    </NavigableContainer>
  );
};

CaseHome.displayName = 'CaseHome';
const connected = connector(CaseHome);

export default connected;
