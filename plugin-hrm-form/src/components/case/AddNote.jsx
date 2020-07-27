import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { getConfig } from '../../HrmFormPlugin';
import { Box, Row, HiddenText, StyledNextStepButton, BottomButtonBar } from '../../styles/HrmStyles';
import { AddNoteContainer, CaseActionTitle, CaseActionDetailFont, CaseActionTextArea } from '../../styles/case';

const AddNote = ({ counselor, value, onChange, handleSaveNote, onClickClose }) => {
  const { strings } = getConfig();

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
          value={value}
          onChange={e => onChange(e.target.value)}
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
          disabled={!value}
        >
          <Template code="BottomBar-SaveNote" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </AddNoteContainer>
  );
};

AddNote.displayName = 'AddNote';
AddNote.propTypes = {
  counselor: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  handleSaveNote: PropTypes.func.isRequired,
  onClickClose: PropTypes.func.isRequired,
};

AddNote.defaultProps = {
  value: '',
};

export default AddNote;
