import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Box, Row, HiddenText, StyledNextStepButton } from '../../styles/HrmStyles';
import {
  CaseContainer,
  CaseActionTitle,
  CaseActionDetailFont,
  CaseActionTextArea,
  CaseActionButtonBar,
} from '../../styles/case';

const AddNote = ({ counselor, onClickClose }) => {
  return (
    <CaseContainer>
      <Box height="100%" paddingTop="20px" paddingLeft="30px" paddingRight="10px">
        <Row>
          <CaseActionTitle style={{ marginTop: 'auto' }}>
            <Template code="Case-AddNote" />
          </CaseActionTitle>
          <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }}>
            <HiddenText>
              <Template code="Case-CloseButton" />
            </HiddenText>
            <Close />
          </ButtonBase>
        </Row>
        <Row>
          <CaseActionDetailFont style={{ marginRight: 20 }}>Added: 4/30/2020</CaseActionDetailFont>
          <CaseActionDetailFont style={{ marginRight: 20 }}>
            <Template code="Case-AddNoteCounselor" /> {counselor}
          </CaseActionDetailFont>
          <CaseActionDetailFont>Supervisor: Nick Hurlburt</CaseActionDetailFont>
        </Row>
        <HiddenText id="Case-TypeHere-label">
          <Template code="Case-AddNoteTypeHere" />
        </HiddenText>
        <CaseActionTextArea rows={25} aria-labelledby="Case-TypeHere-label" />
      </Box>
      <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
      <CaseActionButtonBar>
        <Box marginRight="15px">
          <StyledNextStepButton secondary roundCorners onClick={onClickClose}>
            <Template code="BottomBar-Cancel" />
          </StyledNextStepButton>
        </Box>
        <StyledNextStepButton roundCorners onClick={() => console.log('asd2')}>
          <Template code="BottomBar-SaveNote" />
        </StyledNextStepButton>
      </CaseActionButtonBar>
    </CaseContainer>
  );
};

AddNote.displayName = 'AddNote';
AddNote.propTypes = {
  counselor: PropTypes.string.isRequired,
  onClickClose: PropTypes.func.isRequired,
};

export default AddNote;
