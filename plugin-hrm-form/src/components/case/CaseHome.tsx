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
import { ApiCaseSection } from '../../services/caseSectionService';
import { selectDefinitionVersionForCase } from '../../states/configuration/selectDefinitions';
import selectCaseHelplineData from '../../states/case/selectCaseHelplineData';
import { selectCounselorName } from '../../states/configuration/selectCounselorsHash';

export type CaseHomeProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  handleClose?: () => void;
  handleSaveAndEnd: () => void;
  can: (action: PermissionActionType) => boolean;
};

const MAX_ACTIVITIES_IN_TIMELINE_SECTION = 5;

const mapStateToProps = (state: RootState, { task }: CaseHomeProps) => {
  const connectedCaseState = selectCurrentRouteCaseState(state, task.taskSid);
  const taskContact = isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact;
  const routing = selectCurrentTopmostRouteForTask(state, task.taskSid) as CaseRoute;
  const { connectedCase } = connectedCaseState ?? {};
  const connectedContacts = connectedCase?.connectedContacts ?? [];
  const isCreating = Boolean(
    connectedContacts.length === 1 && connectedContacts[0].id === taskContact?.id && !taskContact?.finalizedAt,
  );
  const activityCount = routing.route === 'case' ? selectCaseActivityCount(state, routing.caseId) : 0;
  const definitionVersion = selectDefinitionVersionForCase(state, connectedCase);
  const counselor = selectCounselorName(state, connectedCase?.twilioWorkerId);

  return {
    isCreating,
    connectedCaseState,
    taskContact,
    hasMoreActivities: activityCount > MAX_ACTIVITIES_IN_TIMELINE_SECTION,
    office: selectCaseHelplineData(state, routing.caseId),
    definitionVersion,
    counselor,
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
  handleClose,
  handleSaveAndEnd,
  can,
  connectedCaseState,
  isCreating,
  hasMoreActivities,
  office,
  counselor,
}) => {
  if (!connectedCaseState) return null; // narrow type before deconstructing
  const { connectedCase } = connectedCaseState;
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

  const onPrintCase = () => {
    openModal({ route: 'case', subroute: 'case-print-view', caseId });
  };

  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const {
    sections: {
      incident: incidentSections,
      perpetrator: perpetratorSections,
      household: householdSections,
      document: documentSections,
    },
    info: { followUpDate, childIsAtRisk },
    status,
    id,
    label,
    categories,
    createdAt,
    updatedAt,
  } = connectedCase;
  const statusLabel = definitionVersion.caseStatus[status]?.label ?? status;

  const itemRowRenderer = (itemTypeName: string, viewSubroute: CaseSectionSubroute, items: ApiCaseSection[]) => {
    const itemRows = () => {
      return items.length ? (
        <>
          {items.map((item, index) => (
            <InformationRow
              key={`${itemTypeName}-${index}`}
              person={item.sectionTypeSpecificData}
              onClickView={() => onViewCaseItemClick(viewSubroute)(item.sectionId)}
            />
          ))}
        </>
      ) : null;
    };
    itemRows.displayName = `${itemTypeName}Rows`;
    return itemRows;
  };

  const householdRows = itemRowRenderer(
    'form',
    NewCaseSubroutes.Household,
    (householdSections ?? []).map((h, index) => {
      return { ...h, index };
    }),
  );

  const perpetratorRows = itemRowRenderer(
    'form',
    NewCaseSubroutes.Perpetrator,
    (perpetratorSections ?? []).map((p, index) => {
      return { ...p, index };
    }),
  );

  const incidentRows = () => (
    <>
      {(incidentSections ?? []).map((item, index) => {
        return (
          <IncidentInformationRow
            key={`incident-${index}`}
            onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Incident)(item.sectionId)}
            definition={caseForms.IncidentForm}
            values={item.sectionTypeSpecificData}
            layoutDefinition={caseLayouts.incidents}
          />
        );
      })}
    </>
  );
  const documentRows = () => (
    <>
      {(documentSections ?? []).map((item, index) => {
        return (
          <DocumentInformationRow
            key={`document-${index}`}
            caseSection={item}
            onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Document)(item.sectionId)}
          />
        );
      })}
    </>
  );

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
      <CaseContainer
        style={{
          overflowY: isCreating ? 'scroll' : 'visible',
          borderBottom: isCreating ? '1px solid #e5e5e5' : 'none',
        }}
      >
        <AddToCaseBanner task={task} />

        {isCreating && (
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
            availableStatusTransitions={connectedCaseState.availableStatusTransitions}
            office={office?.label}
            handlePrintCase={onPrintCase}
            definitionVersion={definitionVersion}
            isOrphanedCase={(connectedCase.connectedContacts ?? []).length === 0}
            editCaseSummary={onEditCaseSummaryClick}
            isCreating={isCreating}
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
        <Box margin="25px 0 0 0">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_HOUSEHOLD)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Household)}
            sectionTypeId="Household"
          >
            {householdRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 0 0 0">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_PERPETRATOR)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Perpetrator)}
            sectionTypeId="Perpetrator"
          >
            {perpetratorRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 0 0 0">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_INCIDENT)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Incident)}
            sectionTypeId="Incident"
          >
            {incidentRows()}
          </CaseSection>
        </Box>
        {enableUploadDocuments && (
          <Box margin="25px 0 0 0">
            <CaseSection
              onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Document)}
              canAdd={() => can(PermissionActions.ADD_DOCUMENT)}
              sectionTypeId="Document"
            >
              {documentRows()}
            </CaseSection>
          </Box>
        )}
      </CaseContainer>
      {connect && (
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
