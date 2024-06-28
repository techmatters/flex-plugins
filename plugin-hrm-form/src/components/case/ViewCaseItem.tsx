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
import { connect, ConnectedProps } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Edit from '@material-ui/icons/Edit';
import { DefinitionVersion, isNonSaveable } from 'hrm-form-definitions';

import { CaseStateEntry } from '../../states/case/types';
import { BottomButtonBar, Box, StyledNextStepButton } from '../../styles';
import { CaseLayout, FullWidthFormTextContainer } from './styles';
import { RootState } from '../../states';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { AppRoutes, CaseItemAction, isViewCaseSectionRoute } from '../../states/routing/types';
import * as RoutingActions from '../../states/routing/actions';
import { CaseSectionApi } from '../../states/case/sections/api';
import { FormTargetObject } from '../common/forms/types';
import NavigableContainer from '../NavigableContainer';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';
import selectCaseItemHistory from '../../states/case/sections/selectCaseItemHistory';
import { CaseSectionTypeSpecificData } from '../../services/caseSectionService';

export type ViewCaseItemProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  sectionApi: CaseSectionApi;
  includeAddedTime?: boolean;
  canEdit: () => boolean;
};

const mapStateToProps = (
  state: RootState,
  { task, sectionApi }: ViewCaseItemProps,
): {
  caseItemHistory: ReturnType<typeof selectCaseItemHistory>;
  currentRoute: AppRoutes;
  sections: CaseStateEntry['sections'];
  form: CaseSectionTypeSpecificData;
} => {
  const { sections } = selectCurrentRouteCaseState(state, task.taskSid) || {};
  const currentRoute = selectCurrentTopmostRouteForTask(state, task.taskSid);
  if (isViewCaseSectionRoute(currentRoute)) {
    return {
      caseItemHistory: selectCaseItemHistory(state, currentRoute.caseId, sectionApi, currentRoute.id),
      currentRoute,
      sections,
      form: sectionApi.getSectionItemById(sections, currentRoute.id).sectionTypeSpecificData,
    };
  }
  return {
    currentRoute,
    form: undefined,
    caseItemHistory: undefined,
    sections: undefined,
  };
};

const mapToDispatchProps = {
  changeRoute: RoutingActions.changeRoute,
  goBack: RoutingActions.newGoBackAction,
};

const connector = connect(mapStateToProps, mapToDispatchProps);

type Props = ViewCaseItemProps & ConnectedProps<typeof connector>;

const ViewCaseItem: React.FC<Props> = ({
  task,
  currentRoute,
  changeRoute,
  definitionVersion,
  sectionApi,
  sections,
  canEdit,
  caseItemHistory,
  form,
}) => {
  if (!isViewCaseSectionRoute(currentRoute) || !sections) {
    return null;
  }
  const { addingCounsellorName, added, updatingCounsellorName, updated } = caseItemHistory;
  const formDefinition = sectionApi.getSectionFormDefinition(definitionVersion).filter(fd => !isNonSaveable(fd));

  const onEditCaseItemClick = () => {
    changeRoute({ ...currentRoute, action: CaseItemAction.Edit }, task.taskSid);
  };

  const targetObject: FormTargetObject = {
    id: currentRoute.caseId,
    type: 'case',
  };

  return (
    <CaseLayout>
      <NavigableContainer task={task} titleCode={`Case-View${sectionApi.label}`}>
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
                  <SectionEntryValue value={form[e.name]} targetObject={targetObject} definition={e} />
                </SectionEntry>
              ))}
            </Box>
          )}
        </Box>
        {canEdit() && (
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

export default connector(ViewCaseItem);
