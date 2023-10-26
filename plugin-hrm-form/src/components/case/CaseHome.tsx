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

import { CaseContainer } from '../../styles/case';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles/HrmStyles';
import CaseDetailsComponent from './CaseDetails';
import Timeline from './Timeline';
import CaseSection from './CaseSection';
import { PermissionActions, PermissionActionType } from '../../permissions';
import {
  AppRoutes,
  CaseItemAction,
  CaseSectionSubroute,
  isCaseRoute,
  NewCaseSubroutes,
} from '../../states/routing/types';
import CaseSummary from './CaseSummary';
import { RootState } from '../../states';
import { Activity, CaseDetails, CaseState } from '../../states/case/types';
import { CustomITask, EntryInfo, StandaloneITask } from '../../types/types';
import * as RoutingActions from '../../states/routing/actions';
import InformationRow from './InformationRow';
import TimelineInformationRow from './TimelineInformationRow';
import DocumentInformationRow from './DocumentInformationRow';
import { householdSectionApi } from '../../states/case/sections/household';
import { perpetratorSectionApi } from '../../states/case/sections/perpetrator';
import { getAseloFeatureFlags } from '../../hrmConfig';
import { connectedCaseBase, namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';

export type CaseHomeProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  caseDetails: CaseDetails;
  timeline: Activity[];
  isCreating?: boolean;
  handleClose?: () => void;
  handleSaveAndEnd: () => void;
  handleCancelNewCaseAndClose: () => void;
  handleUpdate: () => void;
  can: (action: PermissionActionType) => boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = CaseHomeProps & ConnectedProps<typeof connector>;

const CaseHome: React.FC<Props> = ({
  definitionVersion,
  task,
  routing,
  changeRoute,
  isCreating,
  handleClose,
  handleSaveAndEnd,
  handleCancelNewCaseAndClose,
  timeline,
  caseDetails,
  can,
  connectedCaseState,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  if (!connectedCaseState || !routing || !isCaseRoute(routing)) return null; // narrow type before deconstructing

  const featureFlags = getAseloFeatureFlags();
  const { route } = routing;

  const onViewCaseItemClick = (targetSubroute: CaseSectionSubroute) => (id: string) => {
    changeRoute({ route: 'case', subroute: targetSubroute, action: CaseItemAction.View, id });
  };

  const onAddCaseItemClick = (targetSubroute: CaseSectionSubroute) => () => {
    changeRoute({ route: 'case', subroute: targetSubroute, action: CaseItemAction.Add });
  };

  const onPrintCase = () => {
    changeRoute({ route: 'case', subroute: 'case-print-view' });
  };

  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const {
    incidents,
    perpetrators,
    households,
    documents,
    office,
    id,
    contactIdentifier,
    categories,
    contact,
    createdAt,
    updatedAt,
    childIsAtRisk,
    caseCounselor,
    status,
    followUpDate,
  } = caseDetails;
  const statusLabel = definitionVersion.caseStatus[status]?.label ?? status;

  const itemRowRenderer = (itemTypeName: string, viewSubroute: CaseSectionSubroute, items: EntryInfo[]) => {
    const itemRows = () => {
      return items.length ? (
        <>
          {items.map((item, index) => (
            <InformationRow
              key={`${itemTypeName}-${index}`}
              person={item[itemTypeName]}
              onClickView={() => onViewCaseItemClick(viewSubroute)(item.id)}
            />
          ))}
        </>
      ) : null;
    };
    itemRows.displayName = `${name}Rows`;
    return itemRows;
  };

  const householdRows = itemRowRenderer(
    'form',
    NewCaseSubroutes.Household,
    households.map((h, index) => {
      return { ...householdSectionApi.toForm(h), index };
    }),
  );

  const perpetratorRows = itemRowRenderer(
    'form',
    NewCaseSubroutes.Perpetrator,
    perpetrators.map((p, index) => {
      return { ...perpetratorSectionApi.toForm(p), index };
    }),
  );

  const incidentRows = () => {
    return incidents.length ? (
      <>
        {incidents.map((item, index) => {
          return (
            <TimelineInformationRow
              key={`incident-${index}`}
              onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Incident)(item.id)}
              definition={caseForms.IncidentForm}
              values={item.incident}
              layoutDefinition={caseLayouts.incidents}
            />
          );
        })}
      </>
    ) : null;
  };

  const documentRows = () => {
    return documents.length ? (
      <>
        {documents.map((item, index) => {
          return (
            <DocumentInformationRow
              key={`document-${index}`}
              documentEntry={item}
              onClickView={() => onViewCaseItemClick(NewCaseSubroutes.Document)(item.id)}
            />
          );
        })}
      </>
    ) : null;
  };

  const onEditCaseSummaryClick = () => {
    changeRoute({ route: 'case', subroute: 'caseSummary', action: CaseItemAction.Edit, id: '' });
  };

  return (
    <>
      <CaseContainer data-testid="CaseHome-CaseDetailsComponent">
        <Box marginLeft="25px" marginTop="13px">
          <CaseDetailsComponent
            caseId={id.toString()}
            contactIdentifier={contactIdentifier}
            statusLabel={statusLabel}
            can={can}
            counselor={caseCounselor}
            categories={categories}
            createdAt={createdAt}
            updatedAt={updatedAt}
            followUpDate={followUpDate}
            childIsAtRisk={childIsAtRisk}
            availableStatusTransitions={connectedCaseState.availableStatusTransitions}
            office={office?.label}
            handlePrintCase={onPrintCase}
            definitionVersion={definitionVersion}
            isOrphanedCase={!contact}
            editCaseSummary={onEditCaseSummaryClick}
          />
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSummary task={task} />
        </Box>
        <Box margin="25px 0 0 25px">
          <Timeline timelineActivities={timeline} taskSid={task.taskSid} can={can} route={route} />
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_HOUSEHOLD)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Household)}
            sectionTypeId="Household"
          >
            {householdRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_PERPETRATOR)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Perpetrator)}
            sectionTypeId="Perpetrator"
          >
            {perpetratorRows()}
          </CaseSection>
        </Box>
        <Box margin="25px 0 0 25px">
          <CaseSection
            canAdd={() => can(PermissionActions.ADD_INCIDENT)}
            onClickAddItem={onAddCaseItemClick(NewCaseSubroutes.Incident)}
            sectionTypeId="Incident"
          >
            {incidentRows()}
          </CaseSection>
        </Box>
        {featureFlags.enable_upload_documents && (
          <Box margin="25px 0 0 25px">
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
      <BottomButtonBar>
        {isCreating && (
          <>
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="CaseHome-CancelButton"
                secondary="true"
                roundCorners
                onClick={handleCancelNewCaseAndClose}
              >
                <Template code="BottomBar-CancelNewCaseAndClose" />
              </StyledNextStepButton>
            </Box>
            <StyledNextStepButton roundCorners onClick={handleSaveAndEnd} data-testid="BottomBar-SaveCaseAndEnd">
              <Template code="BottomBar-SaveAndEnd" />
            </StyledNextStepButton>
          </>
        )}
        {!isCreating && (
          <>
            <Box marginRight="15px">
              <StyledNextStepButton
                data-testid="CaseHome-CloseButton"
                secondary="true"
                roundCorners
                onClick={handleClose}
              >
                <Template code="BottomBar-Close" />
              </StyledNextStepButton>
            </Box>
          </>
        )}
      </BottomButtonBar>
    </>
  );
};

CaseHome.displayName = 'CaseHome';

const mapStateToProps = (state: RootState, { task }: CaseHomeProps) => {
  const routing = getCurrentTopmostRouteForTask(state[namespace].routing, task.taskSid);
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const connectedCaseState = caseState.tasks[task.taskSid];

  return { routing, connectedCaseState };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: CaseHomeProps) => ({
  changeRoute: (route: AppRoutes) => dispatch(RoutingActions.changeRoute(route, task.taskSid)),
});
const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(CaseHome);

export default connected;
