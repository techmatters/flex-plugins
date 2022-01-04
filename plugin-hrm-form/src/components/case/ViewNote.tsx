/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';

import type { DefinitionVersion } from '../common/forms/types';
import { Container, BottomButtonBar, StyledNextStepButton } from '../../styles/HrmStyles';
import { namespace, connectedCaseBase, configurationBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import { CaseLayout, NoteContainer } from '../../styles/case';
import ActionHeader from './ActionHeader';
import { formatName } from '../../utils';
import type { CustomITask, StandaloneITask } from '../../types/types';

type OwnProps = {
  task: CustomITask | StandaloneITask;
  definitionVersion: DefinitionVersion;
  onClickClose: () => void;
};

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];
  const counselorsHash = state[namespace][configurationBase].counselors.hash;

  return { tempInfo: temporaryCaseInfo, counselorsHash };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const ViewNote: React.FC<Props> = ({ tempInfo, onClickClose, counselorsHash, definitionVersion }) => {
  if (!tempInfo || tempInfo.screen !== 'view-note') return null;

  const { counselor, date, note } = tempInfo.info;
  const counselorName = formatName(counselorsHash[counselor]);
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
export default connect(mapStateToProps, null)(ViewNote);
