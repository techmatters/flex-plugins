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

import React from 'react';
import { Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseContainer, CaseDetailsBorder, ViewButton } from './styles';
import { BottomButtonBar, Box, SaveAndEndButton } from '../../styles';
import CaseDetails from './caseDetails/CaseDetails';
import Timeline from './timeline/Timeline';
import CaseSection from './CaseSection';
import { PermissionActions, PermissionActionType } from '../../permissions';
import { AppRoutes, CaseItemAction, CaseRoute } from '../../states/routing/types';
import CaseSummary from './caseDetails/CaseSummary';
import { RootState } from '../../states';
import { CustomITask, StandaloneITask } from '../../types/types';
import * as RoutingActions from '../../states/routing/actions';
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
  selectFirstContactByCaseId,
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

const CaseHome: React.FC<CaseHomeProps> = ({ task, handlePrintCase, handleClose, handleSaveAndEnd, can }) => {
  // Hooks
  const connectedCaseState = useSelector((state: RootState) => selectCurrentRouteCaseState(state, task.taskSid));
  const { connectedCase, availableStatusTransitions = [] } = connectedCaseState ?? {};
  const taskContact = useSelector((state: RootState) =>
    isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact,
  );
  const routing = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, task.taskSid) as CaseRoute);

  const caseContacts = useSelector((state: RootState) => selectContactsByCaseIdInCreatedOrder(state, routing.caseId));
  const firstConnectedContact = useSelector(
    (state: RootState) => selectFirstContactByCaseId(state, routing.caseId)?.savedContact,
  );
  const activityCount = useSelector((state: RootState) =>
    routing.route === 'case' ? selectTimelineCount(state, routing.caseId, MAIN_TIMELINE_ID) : 0,
  );

  const definitionVersion = useSelector((state: RootState) => selectDefinitionVersionForCase(state, connectedCase));
  const counselor = useSelector((state: RootState) => selectCounselorName(state, connectedCase?.twilioWorkerId));
  const office = useSelector((state: RootState) => selectCaseHelplineData(state, routing.caseId));

  const dispatch = useDispatch();
  const openModal = (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, task.taskSid));
  // End Hooks
  if (!connectedCase) return null; // narrow type before deconstructing

  const isNewContact = Boolean(taskContact && taskContact.caseId === routing.caseId && !taskContact.finalizedAt);
  const isNewCase = caseContacts.length === 1 && taskContact && taskContact.caseId === routing.caseId;
  const isOrphanedCase = !firstConnectedContact;
  const label = contactLabelFromHrmContact(definitionVersion, firstConnectedContact ?? taskContact, {
    placeholder: '',
    substituteForId: false,
  });
  const hasMoreActivities = activityCount > MAX_ACTIVITIES_IN_TIMELINE_SECTION;

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
            task={task}
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

export default CaseHome;
