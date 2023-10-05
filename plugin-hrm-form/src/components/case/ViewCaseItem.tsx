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
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Edit from '@material-ui/icons/Edit';
import { DefinitionVersion, isNonSaveable } from 'hrm-form-definitions';

import { BottomButtonBar, Box, Container, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseLayout, FullWidthFormTextContainer } from '../../styles/case';
import { configurationBase, connectedCaseBase, namespace, RootState } from '../../states';
import { SectionEntry, SectionEntryValue } from '../common/forms/SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { caseItemHistory, CaseState } from '../../states/case/types';
import { ViewCaseSectionRoute, CaseItemAction } from '../../states/routing/types';
import * as RoutingActions from '../../states/routing/actions';
import { CaseSectionApi } from '../../states/case/sections/api';
import { FormTargetObject } from '../common/forms/types';

const mapStateToProps = (state: RootState, ownProps: ViewCaseItemProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { connectedCase } = caseState.tasks[ownProps.task.taskSid];

  return { counselorsHash, connectedCase };
};

export type ViewCaseItemProps = {
  task: CustomITask | StandaloneITask;
  routing: ViewCaseSectionRoute;
  definitionVersion: DefinitionVersion;
  exitItem: () => void;
  sectionApi: CaseSectionApi<unknown>;
  includeAddedTime?: boolean;
  canEdit: () => boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = ViewCaseItemProps & ReturnType<typeof mapStateToProps> & typeof mapToDispatchProps;

const ViewCaseItem: React.FC<Props> = ({
  task,
  routing,
  counselorsHash,
  changeRoute,
  exitItem,
  definitionVersion,
  sectionApi,
  connectedCase,
  canEdit,
}) => {
  const item = sectionApi.toForm(sectionApi.getSectionItemById(connectedCase.info, routing.id));

  const { addingCounsellorName, added, updatingCounsellorName, updated } = caseItemHistory(item, counselorsHash);
  const formDefinition = sectionApi.getSectionFormDefinition(definitionVersion).filter(fd => !isNonSaveable(fd));

  const onEditCaseItemClick = () => {
    changeRoute({ ...routing, action: CaseItemAction.Edit }, task.taskSid);
  };

  const targetObject: FormTargetObject = {
    id: connectedCase?.id,
    type: 'case',
  };

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate={`Case-View${sectionApi.label}`}
          onClickClose={exitItem}
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
            <>
              {formDefinition.map(e => (
                <SectionEntry key={`entry-${e.label}`} descriptionKey={e.label}>
                  <SectionEntryValue value={item.form[e.name]} targetObject={targetObject} definition={e} />
                </SectionEntry>
              ))}
            </>
          </Box>
        )}
      </Container>
      <BottomButtonBar>
        {canEdit() && (
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
        )}
        <Box marginRight="15px">
          <StyledNextStepButton roundCorners onClick={exitItem} data-testid="Case-CloseButton">
            <Template code="CloseButton" />
          </StyledNextStepButton>
        </Box>
      </BottomButtonBar>
    </CaseLayout>
  );
};

ViewCaseItem.displayName = 'ViewCaseItem';

const mapToDispatchProps = {
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapToDispatchProps)(ViewCaseItem);
