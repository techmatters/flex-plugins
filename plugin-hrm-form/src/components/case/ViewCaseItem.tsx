/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import Edit from '@material-ui/icons/Edit';
import { FormDefinition } from 'hrm-form-definitions';

import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseLayout, FullWidthFormTextContainer } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import SectionEntry from '../SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { isViewTemporaryCaseInfo } from '../../states/case/types';
import { AppRoutesWithCase, ViewCastSubrouteToEditCaseSubroute } from '../../states/routing/types';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';

const mapStateToProps = (state: RootState, ownProps: ViewCaseItemProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];

  return { counselorsHash, temporaryCaseInfo };
};

export type ViewCaseItemProps = {
  task: CustomITask | StandaloneITask;
  route: AppRoutesWithCase['route'];
  onClickClose: () => void;
  itemType: string;
  formDefinition: FormDefinition;
  includeAddedTime?: boolean;
};

// eslint-disable-next-line no-use-before-define
type Props = ViewCaseItemProps & ReturnType<typeof mapStateToProps> & typeof mapToDispatchProps;

const ViewCaseItem: React.FC<Props> = ({
  task,
  route,
  counselorsHash,
  temporaryCaseInfo,
  updateTempInfo,
  changeRoute,
  onClickClose,
  formDefinition,
  itemType,
  includeAddedTime = true,
}) => {
  if (!isViewTemporaryCaseInfo(temporaryCaseInfo))
    throw new Error('This component only supports temporary case info of the ViewTemporaryCaseInfo type');
  const counselorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);

  const { form } = temporaryCaseInfo.info;

  const onEditCaseItemClick = () => {
    updateTempInfo(
      { screen: ViewCastSubrouteToEditCaseSubroute[temporaryCaseInfo.screen], info: temporaryCaseInfo.info },
      task.taskSid,
    );
    changeRoute({ route, subroute: ViewCastSubrouteToEditCaseSubroute[temporaryCaseInfo.screen] }, task.taskSid);
  };

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate={`Case-View${itemType}`}
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
          includeTime={includeAddedTime}
        />
        {formDefinition.length === 1 && formDefinition[0].type === 'textarea' ? (
          <FullWidthFormTextContainer data-testid="Case-ViewCaseItemScreen-FullWidthTextArea">
            {form[formDefinition[0].name]}
          </FullWidthFormTextContainer>
        ) : (
          <Box paddingTop="10px">
            <>
              {formDefinition.map(e => (
                <SectionEntry
                  key={`entry-${e.label}`}
                  description={<Template code={e.label} />}
                  value={form[e.name]}
                  definition={e}
                />
              ))}
            </>
          </Box>
        )}
      </Container>
      <BottomButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton secondary roundCorners onClick={onEditCaseItemClick} data-testid="Case-EditButton">
            <Template code="EditButton" />
          </StyledNextStepButton>
        </Box>
        <Box marginRight="15px">
          <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-CloseButton">
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
