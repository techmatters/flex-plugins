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

class AddNote extends React.PureComponent {
  static displayName = 'AddNote';

  static propTypes = {
    counselor: PropTypes.string.isRequired,
    handleSaveNote: PropTypes.func.isRequired,
    onClickClose: PropTypes.func.isRequired,
  };

  state = {
    newNote: '',
  };

  render() {
    const { counselor, handleSaveNote, onClickClose } = this.props;

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
            aria-labelledby="Case-TypeHere-label"
            rows={25}
            value={this.state.newNote}
            onChange={e => this.setState({ newNote: e.target.value })}
          />
        </Box>
        <div style={{ width: '100%', height: 5, backgroundColor: '#ffffff' }} />
        <CaseActionButtonBar>
          <Box marginRight="15px">
            <StyledNextStepButton secondary roundCorners onClick={onClickClose}>
              <Template code="BottomBar-Cancel" />
            </StyledNextStepButton>
          </Box>
          <StyledNextStepButton
            roundCorners
            onClick={() => handleSaveNote(this.state.newNote)}
            disabled={!this.state.newNote}
          >
            <Template code="BottomBar-SaveNote" />
          </StyledNextStepButton>
        </CaseActionButtonBar>
      </CaseContainer>
    );
  }
}

export default AddNote;
