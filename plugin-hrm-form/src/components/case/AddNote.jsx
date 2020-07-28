import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { getConfig } from '../../HrmFormPlugin';
import { Box, Row, HiddenText, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { AddNoteContainer, CaseActionTitle, CaseActionDetailFont, CaseActionTextArea } from '../../styles/case';
import { taskType, formType } from '../../types';
import { Actions } from '../../states/ContactState';
import { namespace, contactFormsBase } from '../../states';

const AddNote = ({ task, form, counselor, onClickClose, dispatch }) => {
  const { strings } = getConfig();
  const { connectedCase, temporaryCaseInfo } = form.metadata;

  const handleOnChangeNote = newNote => dispatch(Actions.temporaryCaseInfo(newNote, task.taskSid));

  const handleSaveNote = () => {
    const { info } = connectedCase;
    const newNoteObj = { note: temporaryCaseInfo, createdAt: new Date().toISOString() };
    const notes = info && info.notes ? [...info.notes, newNoteObj] : [newNoteObj];
    const newInfo = info ? { ...info, notes } : { notes };
    dispatch(Actions.updateCaseInfo(newInfo, task.taskSid));
    dispatch(Actions.changeRoute('new-case', task.taskSid));
  };

  return (
    <AddNoteContainer>
      <Box height="100%" paddingTop="20px" paddingLeft="30px" paddingRight="10px">
        <Row>
          <CaseActionTitle style={{ marginTop: 'auto' }}>
            <Template code="Case-AddNote" />
          </CaseActionTitle>
          <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }} data-testid="Case-AddNoteScreen-CloseCross">
            <HiddenText>
              <Template code="Case-CloseButton" />
            </HiddenText>
            <Close />
          </ButtonBase>
        </Row>
        <Row>
          <CaseActionDetailFont style={{ marginRight: 20 }}>
            <Template code="Case-AddNoteAdded" /> {new Date().toLocaleDateString(navigator.language)}
          </CaseActionDetailFont>
          <CaseActionDetailFont style={{ marginRight: 20 }}>
            <Template code="Case-AddNoteCounselor" /> {counselor}
          </CaseActionDetailFont>
        </Row>
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
          <StyledNextStepButton
            data-testid="Case-AddNoteScreen-CloseButton"
            secondary
            roundCorners
            onClick={onClickClose}
          >
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
    </AddNoteContainer>
  );
};

AddNote.displayName = 'AddNote';
AddNote.propTypes = {
  task: taskType.isRequired,
  form: formType.isRequired,
  counselor: PropTypes.string.isRequired,
  onClickClose: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
});

export default connect(mapStateToProps)(AddNote);
