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

import { BottomButtonBar, Box } from '../../styles/HrmStyles';
import { StyledNextStepButton } from '../../styles/buttons';
import { CaseLayout, FullWidthFormTextContainer } from './styles';
import { RootState } from '../../states';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { caseItemHistory } from '../../states/case/types';
import { CaseItemAction, isViewCaseSectionRoute } from '../../states/routing/types';
import * as RoutingActions from '../../states/routing/actions';
import { CaseSectionApi } from '../../states/case/sections/api';
import { FormTargetObject } from '../common/forms/types';
import NavigableContainer from '../NavigableContainer';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { selectCounselorsHash } from '../../states/configuration/selectCounselorsHash';
import selectCurrentRouteCaseState from '../../states/case/selectCurrentRouteCase';

const mapStateToProps = (state: RootState, { task }: ViewCaseItemProps) => {
  return {
    counselorsHash: selectCounselorsHash(state),
    currentRoute: selectCurrentTopmostRouteForTask(state, task.taskSid),
    connectedCase: selectCurrentRouteCaseState(state, task.taskSid)?.connectedCase,
  };
};

export type ViewCaseItemProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  sectionApi: CaseSectionApi<unknown>;
  includeAddedTime?: boolean;
  canEdit: () => boolean;
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
  counselorsHash,
  changeRoute,
  definitionVersion,
  sectionApi,
  connectedCase,
  canEdit,
}) => {
  if (!isViewCaseSectionRoute(currentRoute)) {
    return null;
  }

  const item = sectionApi.toForm(sectionApi.getSectionItemById(connectedCase.info, currentRoute.id));

  const { addingCounsellorName, added, updatingCounsellorName, updated } = caseItemHistory(item, counselorsHash);
  const formDefinition = sectionApi.getSectionFormDefinition(definitionVersion).filter(fd => !isNonSaveable(fd));

  const onEditCaseItemClick = () => {
    changeRoute({ ...currentRoute, action: CaseItemAction.Edit }, task.taskSid);
  };

  const targetObject: FormTargetObject = {
    id: connectedCase?.id,
    type: 'case',
  };

  return (
    <CaseLayout>
      <NavigableContainer task={task} titleCode={`Case-View${sectionApi.label}`}>
        <Box height="100%">
          <ActionHeader
            addingCounsellor={addingCounsellorName}
            added={added}
            updatingCounsellor={updatingCounsellorName}
            updated={updated}
          />
          {formDefinition.length === 1 && formDefinition[0].type === 'textarea' ? (
            <FullWidthFormTextContainer data-testid="Case-ViewCaseItemScreen-FullWidthTextArea">
              {item.form[formDefinition[0].name]}
            </FullWidthFormTextContainer>
          ) : (
            <Box paddingTop="10px">
              {formDefinition.map(e => (
                <SectionEntry key={`entry-${e.label}`} descriptionKey={e.label}>
                  <SectionEntryValue value={item.form[e.name]} targetObject={targetObject} definition={e} />
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
