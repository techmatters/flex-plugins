/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Edit from '@material-ui/icons/Edit';
import { DefinitionVersion, isNonSaveable } from 'hrm-form-definitions';

import { BottomButtonBar, Box, Container, StyledNextStepButton } from '../../styles/HrmStyles';
import { CaseLayout, FullWidthFormTextContainer } from '../../styles/case';
import { configurationBase, connectedCaseBase, namespace, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import SectionEntry from '../SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { caseItemHistory } from '../../states/case/types';
import { ViewCaseSectionRoute, CaseItemAction } from '../../states/routing/types';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseSectionApi } from '../../states/case/sections/api';

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
  updateTempInfo,
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
    updateTempInfo({ screen: routing.subroute, action: CaseItemAction.Edit, info: item }, task.taskSid);
    changeRoute({ ...routing, action: CaseItemAction.Edit }, task.taskSid);
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
                <SectionEntry
                  key={`entry-${e.label}`}
                  description={<Template code={e.label} />}
                  value={item.form[e.name]}
                  definition={e}
                />
              ))}
            </>
          </Box>
        )}
      </Container>
      <BottomButtonBar>
        {canEdit() && (
          <Box marginRight="15px">
            <StyledNextStepButton secondary roundCorners onClick={onEditCaseItemClick} data-testid="Case-EditButton">
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
  updateTempInfo: CaseActions.updateTempInfo,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapToDispatchProps)(ViewCaseItem);
