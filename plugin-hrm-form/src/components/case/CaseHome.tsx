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

import React, { useEffect } from 'react';
import { Template } from '@twilio/flex-ui';
import { useDispatch, useSelector } from 'react-redux';
import { DefinitionVersion } from 'hrm-form-definitions';

import { CaseContainer, CaseDetailsBorder } from './styles';
import { BottomButtonBar, Box, DestructiveButton, Flex, TertiaryButton } from '../../styles';
import CaseOverviewHeader from './caseOverview/CaseOverviewHeader';
import CaseOverview from './caseOverview';
import Timeline from './timeline/Timeline';
import CaseSection from './CaseSection';
import { PermissionActions, PermissionActionType } from '../../permissions';
import { AppRoutes, CaseItemAction, CaseRoute } from '../../states/routing/types';
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
import {
  newGetTimelineAsyncAction,
  selectCaseLabel,
  selectTimelineContactCategories,
  selectTimelineCount,
} from '../../states/case/timeline';
import { selectDefinitionVersionForCase } from '../../states/configuration/selectDefinitions';
import selectCaseHelplineData from '../../states/case/selectCaseHelplineData';
import { selectCounselorName } from '../../states/configuration/selectCounselorsHash';
import { isContactIdentifierTimelineActivity } from '../../states/case/types';

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
const CONTACTS_TIMELINE_ID = 'print-contacts';

const CaseHome: React.FC<CaseHomeProps> = ({ task, handlePrintCase, handleClose, handleSaveAndEnd, can }) => {
  // Hooks
  const connectedCaseState = useSelector((state: RootState) => selectCurrentRouteCaseState(state, task.taskSid));
  const { connectedCase, availableStatusTransitions = [] } = connectedCaseState ?? {};
  const taskContact = useSelector((state: RootState) =>
    isStandaloneITask(task) ? undefined : selectContactByTaskSid(state, task.taskSid)?.savedContact,
  );
  const routing = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, task.taskSid) as CaseRoute);

  const timelineCategories = useSelector((state: RootState) =>
    selectTimelineContactCategories(state, routing.caseId, CONTACTS_TIMELINE_ID),
  );

  const activityCount = useSelector((state: RootState) =>
    routing.route === 'case' ? selectTimelineCount(state, routing.caseId, MAIN_TIMELINE_ID) : 0,
  );
  const contactCount = useSelector((state: RootState) =>
    routing.route === 'case'
      ? selectTimelineCount(state, routing.caseId, MAIN_TIMELINE_ID, isContactIdentifierTimelineActivity)
      : 0,
  );
  const caseLabel = useSelector((state: RootState) =>
    selectCaseLabel(state, routing.caseId, MAIN_TIMELINE_ID, {
      substituteForId: false,
      placeholder: '',
    }),
  );

  const definitionVersion = useSelector((state: RootState) => selectDefinitionVersionForCase(state, connectedCase));
  const counselor = useSelector((state: RootState) => selectCounselorName(state, connectedCase?.twilioWorkerId));
  const office = useSelector((state: RootState) => selectCaseHelplineData(state, routing.caseId));

  const dispatch = useDispatch();
  useEffect(() => {
    if (!timelineCategories) {
      dispatch(
        newGetTimelineAsyncAction(
          routing.caseId,
          CONTACTS_TIMELINE_ID,
          [],
          true,
          { offset: 0, limit: 10000 },
          `case-list`,
        ),
      );
    }
  }, [routing.caseId, dispatch, timelineCategories]);

  const openModal = (route: AppRoutes) => dispatch(RoutingActions.newOpenModalAction(route, task.taskSid));
  // End Hooks
  if (!connectedCase) return null; // narrow type before deconstructing

  const isNewContact = Boolean(
    contactCount === 1 && taskContact && taskContact.caseId === routing.caseId && !taskContact.finalizedAt,
  );
  const isNewCase = taskContact && taskContact.caseId === routing.caseId;
  const isOrphanedCase = !timelineCategories;
  const label = caseLabel;
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

  const onEditCaseOverviewClick = () => {
    openModal({ route: 'case', subroute: 'caseOverview', action: CaseItemAction.Edit, id: '', caseId });
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
          <CaseOverviewHeader
            caseId={caseId}
            counselor={counselor}
            office={office?.label}
            handlePrintCase={handlePrintCase}
            isOrphanedCase={isOrphanedCase}
            definitionVersion={definitionVersion}
            categories={timelineCategories ?? {}}
          />
          <CaseOverview
            task={task}
            can={can}
            editCaseOverview={onEditCaseOverviewClick}
            availableStatusTransitions={availableStatusTransitions}
            definitionVersion={definitionVersion}
            connectedCase={connectedCase}
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
              <Flex flexDirection="column" width="100%">
                <TertiaryButton style={{ marginTop: '10px' }} onClick={onViewFullTimelineClick}>
                  <Template code="Case-Timeline-OpenFullTimelineButton" />
                </TertiaryButton>
              </Flex>
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
          <DestructiveButton roundCorners onClick={handleSaveAndEnd} data-testid="BottomBar-SaveCaseAndEnd">
            <Template code="BottomBar-SaveAndEnd" />
          </DestructiveButton>
        </BottomButtonBar>
      )}
    </NavigableContainer>
  );
};

CaseHome.displayName = 'CaseHome';

export default CaseHome;
