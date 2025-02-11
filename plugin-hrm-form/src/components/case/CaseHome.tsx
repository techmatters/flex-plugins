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
import { BottomButtonBar, Box, SaveAndEndButton } from '../../styles';
import CaseDetails from './CaseDetails';
import Timeline from './timeline/Timeline';
import CaseSection from './CaseSection';
import { PermissionActions, PermissionActionType } from '../../permissions';
import { AppRoutes, CaseItemAction, CaseRoute } from '../../states/routing/types';
import CaseSummary from './CaseSummary';
import { RootState } from '../../states';
import { CustomITask, StandaloneITask } from '../../types/types';
import * as RoutingActions from '../../states/routing/actions';
import { newCloseModalAction } from '../../states/routing/actions';
import NavigableContainer from '../NavigableContainer';
import { isStandaloneITask } from './Case';
import selectContactByTaskSid from '../../states/contacts/selectContactByTaskSid';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import CaseCreatedBanner from '../caseMergingBanners/CaseCreatedBanner';
import AddToCaseBanner from '../caseMergingBanners/AddToCaseBanner';
import { selectTimelineCount } from '../../states/case/timeline';
import { selectDefinitionVersionForCase } from '../../states/configuration/selectDefinitions';
import selectCaseHelplineData from '../../states/case/selectCaseHelplineData';
import { selectCounselorName } from '../../states/configuration/selectCounselorsHash';
import { contactLabelFromHrmContact } from '../../states/contacts/contactIdentifier';
import {
  selectContactsByCaseIdInCreatedOrder,
  selectFirstCaseContact,
} from '../../states/contacts/selectContactByCaseId';

export type CaseHomeProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  handleClose?: () => void;
  handleSaveAndEnd: () => void;
  handlePrintCase: () => void;
  can: (action: PermissionActionType) => boolean;
};

const MAX_ACTIVITIES_IN_TIMELINE_SECTION = 5;
const MAIN_TIMELINE_ID = 'prime-timeline';

const mapStateToProps = (state: RootState, { task }: CaseHomeProps) => {
  const connectedCaseState = selectCurrentRouteCaseState(state, task.taskSid);
  const taskContact = isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact;
  const routing = selectCurrentTopmostRouteForTask(state, task.taskSid) as CaseRoute;
  const { connectedCase, availableStatusTransitions = [] } = connectedCaseState ?? {};
  const caseContacts = selectContactsByCaseIdInCreatedOrder(state, routing.caseId);

  const firstConnectedContact = selectFirstCaseContact(state, connectedCase);
  const activityCount = routing.route === 'case' ? selectTimelineCount(state, routing.caseId, MAIN_TIMELINE_ID) : 0;
  const isNewContact = Boolean(taskContact && taskContact.caseId === routing.caseId && !taskContact.finalizedAt);
  const isNewCase = caseContacts.length === 1 && taskContact && taskContact.caseId === routing.caseId;
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
    isOrphanedCase: !firstConnectedContact,
    label: contactLabelFromHrmContact(definitionVersion, firstConnectedContact ?? taskContact, {
      placeholder: '',
      substituteForId: false,
    }),
  };
};

const mapDispatchToProps = (dispatch: Dispatch<any>, { task }: CaseHomeProps) => ({
  changeRoute: (route: AppRoutes) => dispatch(RoutingActions.changeRoute(route, task.taskSid)),
  openModal: (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, task.taskSid)),
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
  isOrphanedCase,
  label,
}) => {
  if (!connectedCase) return null; // narrow type before deconstructing
  const caseId = connectedCase.id;

  const orderedListSections = Object.entries(definitionVersion.caseSectionTypes)
    .map(([sectionType]) => ({
      sectionType,
      layout: definitionVersion.layoutVersion.case.sectionTypes[sectionType] ?? {},
    }))
    .filter(({ layout }) => layout.caseHomeLocation === 'list' || !layout.caseHomeLocation)
    .sort(
      ({ layout: layout1 }, { layout: layout2 }) =>
        (layout1.caseHomeOrder ?? Number.MAX_SAFE_INTEGER) - (layout2.caseHomeOrder ?? Number.MAX_SAFE_INTEGER),
    );

  const onViewFullTimelineClick = () => {
    openModal({ route: 'case', subroute: 'timeline', caseId, page: 0 });
  };

  const {
    info: { followUpDate, childIsAtRisk },
    status,
    id,
    categories,
    createdAt,
    updatedAt,
  } = connectedCase;

  const statusLabel = definitionVersion.caseStatus[status]?.label ?? status;

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
            isOrphanedCase={isOrphanedCase}
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
              timelineId={MAIN_TIMELINE_ID}
              pageSize={5}
              titleCode={hasMoreActivities ? 'Case-Timeline-RecentTitle' : 'Case-Timeline-Title'}
            />
            {hasMoreActivities && (
              <ViewButton style={{ marginTop: '10px' }} withDivider={false} onClick={onViewFullTimelineClick}>
                <Template code="Case-Timeline-OpenFullTimelineButton" />
              </ViewButton>
            )}
          </CaseDetailsBorder>
        </Box>
        {orderedListSections.map(({ sectionType }) => {
          return (
            <Box margin="25px 0 0 0" key={sectionType}>
              <CaseSection
                canAdd={() => can(PermissionActions.ADD_CASE_SECTION)}
                taskSid={task.taskSid}
                sectionType={sectionType}
              />
            </Box>
          );
        })}
      </CaseContainer>
      {isNewContact && (
        <BottomButtonBar>
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
