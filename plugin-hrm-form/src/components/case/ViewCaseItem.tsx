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
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Edit from '@material-ui/icons/Edit';
import { DefinitionVersion, isNonSaveable } from '@tech-matters/hrm-form-definitions';

import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles';
import { CaseLayout, FullWidthFormTextContainer } from './styles';
import { RootState } from '../../states';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { CaseItemAction, isViewCaseSectionRoute } from '../../states/routing/types';
import * as RoutingActions from '../../states/routing/actions';
import { FormTargetObject } from '../common/forms/types';
import NavigableContainer from '../NavigableContainer';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import selectCaseItemHistory from '../../states/case/sections/selectCaseItemHistory';
import { getInitializedCan, PermissionActions } from '../../permissions';
import { getSectionItemById } from '../../states/case/sections/get';

export type ViewCaseItemProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  sectionTypeName: string;
  includeAddedTime?: boolean;
};

const ViewCaseItem: React.FC<ViewCaseItemProps> = ({ task, definitionVersion, sectionTypeName }) => {
  // Hooks
  const { sections, connectedCase } = useSelector(
    (state: RootState) =>
      selectCurrentRouteCaseState(state, task.taskSid) || { sections: undefined, connectedCase: undefined },
  );

  const currentRoute = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, task.taskSid));
  const caseItemHistory = useSelector((state: RootState) =>
    isViewCaseSectionRoute(currentRoute)
      ? selectCaseItemHistory(state, currentRoute.caseId, sectionTypeName, currentRoute.id)
      : null,
  );

  const caseSectionDefinition = definitionVersion.caseSectionTypes[sectionTypeName];

  const dispatch = useDispatch();

  // Conditional returns allowed from here
  if (!isViewCaseSectionRoute(currentRoute) || !sections) {
    return null;
  }

  const canEdit = getInitializedCan()(PermissionActions.EDIT_CASE_SECTION, connectedCase);
  const form = getSectionItemById(sectionTypeName)(sections, currentRoute.id).sectionTypeSpecificData;
  const formDefinition = caseSectionDefinition.form.filter(fd => !isNonSaveable(fd));

  const { addingCounsellorName, added, updatingCounsellorName, updated } = caseItemHistory;

  const onEditCaseItemClick = () => {
    dispatch(RoutingActions.changeRoute({ ...currentRoute, action: CaseItemAction.Edit }, task.taskSid));
  };

  const targetObject: FormTargetObject = {
    id: currentRoute.caseId,
    type: 'case',
  };

  const sectionTypeLayoutDefinition = definitionVersion.layoutVersion.case.sectionTypes[sectionTypeName];

  return (
    <CaseLayout>
      <NavigableContainer task={task} titleCode={`CaseSection-View-Title/${sectionTypeName}`}>
        <Box height="100%" style={{ overflowY: 'auto' }}>
          <ActionHeader
            addingCounsellor={addingCounsellorName}
            added={added}
            updatingCounsellor={updatingCounsellorName}
            updated={updated}
          />
          {formDefinition.length === 1 && formDefinition[0].type === 'textarea' ? (
            <FullWidthFormTextContainer data-testid="Case-ViewCaseItemScreen-FullWidthTextArea">
              {form[formDefinition[0].name]}
            </FullWidthFormTextContainer>
          ) : (
            <Box paddingTop="10px">
              {formDefinition.map(e => (
                <SectionEntry key={`entry-${e.label}`} descriptionKey={e.label}>
                  <SectionEntryValue
                    layout={sectionTypeLayoutDefinition?.layout?.[e.name]}
                    value={form[e.name]}
                    form={form}
                    targetObject={targetObject}
                    definition={e}
                  />
                </SectionEntry>
              ))}
            </Box>
          )}
        </Box>
        {canEdit && (
          <BottomButtonBar>
            <Box marginRight="15px">
              <StyledNextStepButton
                secondary="true"
                roundCorners
                onClick={onEditCaseItemClick}
                data-testid="Case-EditButton"
              >
                <Edit fontSize="inherit" style={{ marginRight: 5 }} />
                <Template code="EditButton" />
              </StyledNextStepButton>
            </Box>
          </BottomButtonBar>
        )}
      </NavigableContainer>
    </CaseLayout>
  );
};

ViewCaseItem.displayName = 'ViewCaseItem';

export default ViewCaseItem;
