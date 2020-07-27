import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Box, Row, HiddenText, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { CaseContainer, CaseActionTitle, CaseActionDetailFont, CaseActionTextArea } from '../../styles/case';

const AddNote = ({ counselor, handleSaveNote, onClickClose }) => {
  const [newNote, setNewNote] = useState('');

  return (
    <CaseContainer>
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
          rows={25}
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
        />
      </Box>
      <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
      <BottomButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton
            secondary
            roundCorners
            onClick={onClickClose}
            data-testid="Case-AddNoteScreen-CloseButton"
          >
            <Template code="BottomBar-Cancel" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton
          roundCorners
          onClick={() => handleSaveNote(newNote)}
          disabled={!newNote}
          data-testid="Case-AddNoteScreen-SaveNote"
        >
          <Template code="BottomBar-SaveNote" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseContainer>
  );
};

AddNote.displayName = 'AddNote';
AddNote.propTypes = {
  counselor: PropTypes.string.isRequired,
  handleSaveNote: PropTypes.func.isRequired,
  onClickClose: PropTypes.func.isRequired,
};

export default AddNote;
