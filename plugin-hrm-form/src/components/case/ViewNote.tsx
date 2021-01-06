/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { ITask, Template } from '@twilio/flex-ui';

import { Container, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase, routingBase } from '../../states';
import { CaseState } from '../../states/case/reducer';
import * as RoutingActions from '../../states/routing/actions';
import { CaseLayout, NoteContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';

type OwnProps = {
  task: ITask;
  onClickClose: () => void;
};

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const { route } = state[namespace][routingBase].tasks[ownProps.task.taskSid];

  return { tempInfo: temporaryCaseInfo, counselorsHash, route };
};

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ViewNote: React.FC<Props> = ({ tempInfo, onClickClose, counselorsHash }) => {
  if (!tempInfo || tempInfo.screen !== 'view-note') return null;

  const { counselor, date, note } = tempInfo.info;
  const counselorName = counselorsHash[counselor] || 'Unknown';
  const added = new Date(date);

  return (
    <CaseLayout>
      <Container>
        <ActionHeader titleTemplate="Case-Note" onClickClose={onClickClose} counselor={counselorName} added={added} />
        <NoteContainer data-testid="Case-ViewNoteScreen-Note">{note}</NoteContainer>
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-ViewNoteScreen-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseLayout>
  );
};

ViewNote.displayName = 'ViewNote';

export const UnconnectedViewNote = ViewNote;
export default connect(mapStateToProps, mapDispatchToProps)(ViewNote);
