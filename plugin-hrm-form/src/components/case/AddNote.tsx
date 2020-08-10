/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Template, ITask } from '@twilio/flex-ui';

import ActionHeader from './ActionHeader';
import { getConfig } from '../../HrmFormPlugin';
import { Box, HiddenText, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseActionContainer, CaseActionTextArea } from '../../styles/case';
import { namespace, connectedCaseBase } from '../../states';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import { CaseState } from '../../states/case/reducer';
import { updateCase } from '../../services/CaseService';

type OwnProps = {
  task: ITask;
  counselor: string;
  onClickClose: () => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const AddNote: React.FC<Props> = ({
  task,
  counselor,
  connectedCaseState,
  onClickClose,
  updateTempInfo,
  changeRoute,
  setConnectedCase,
}) => {
  useEffect(() => {
    updateTempInfo('', task.taskSid);
  }, [task.taskSid, updateTempInfo]);

  const { strings } = getConfig();
  const { connectedCase, temporaryCaseInfo } = connectedCaseState;

  const handleOnChangeNote = (newNote: string) => updateTempInfo(newNote, task.taskSid);

  const handleSaveNote = async () => {
    const { info, id } = connectedCase;
    const newNote = temporaryCaseInfo;
    const notes = info && info.notes ? [...info.notes, newNote] : [newNote];
    const newInfo = info ? { ...info, notes } : { notes };
    const updatedCase = await updateCase(id, { info: newInfo });
    setConnectedCase(updatedCase, task.taskSid);
    updateTempInfo('', task.taskSid);
    changeRoute({ route: 'new-case' }, task.taskSid);
  };

  if (typeof temporaryCaseInfo !== 'string') return null;

  return (
    <CaseActionContainer>
      <Box height="100%" paddingTop="20px" paddingLeft="30px" paddingRight="10px">
        <ActionHeader titleTemplate="Case-AddNote" onClickClose={onClickClose} counselor={counselor} />
        <HiddenText id="Case-TypeHere-label">
          <Template code="Case-AddNoteTypeHere" />
        </HiddenText>
        <CaseActionTextArea
          data-testid="Case-AddNoteScreen-TextArea"
          aria-labelledby="Case-TypeHere-label"
          placeholder={strings['Case-AddNoteTypeHere']}
          rows={25}
          value={temporaryCaseInfo}
          onChange={e => handleOnChangeNote(e.target.value)}
        />
      </Box>
      <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
      <BottomButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton data-testid="Case-CloseButton" secondary roundCorners onClick={onClickClose}>
            <Template code="BottomBar-Cancel" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton
          data-testid="Case-AddNoteScreen-SaveNote"
          roundCorners
          onClick={handleSaveNote}
          disabled={!temporaryCaseInfo}
        >
          <Template code="BottomBar-SaveNote" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseActionContainer>
  );
};

AddNote.displayName = 'AddNote';

const mapStateToProps = (state, ownProps: OwnProps) => {
  const caseState: CaseState = state[namespace][connectedCaseBase]; // casting type as inference is not working for the store yet
  const connectedCaseState = caseState.tasks[ownProps.task.taskSid];

  return { connectedCaseState };
};

const mapDispatchToProps = {
  updateTempInfo: CaseActions.updateTempInfo,
  setConnectedCase: CaseActions.setConnectedCase,
  changeRoute: RoutingActions.changeRoute,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNote);
