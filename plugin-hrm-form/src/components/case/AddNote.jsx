import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';
import { ButtonBase } from '@material-ui/core';
import { Close } from '@material-ui/icons';

import { Box, Row } from '../../styles/HrmStyles';
import { CaseContainer, CaseActionTitle, CaseActionDetailFont } from '../../styles/case';

const AddNote = ({ onClickClose }) => {
  return (
    <CaseContainer>
      <Box paddingTop="20px" paddingLeft="30px" paddingRight="10px">
        <Row>
          <CaseActionTitle style={{ marginTop: 'auto' }}>
            <Template code="Case-AddNote" />
          </CaseActionTitle>
          <ButtonBase onClick={onClickClose} style={{ marginLeft: 'auto' }}>
            <Close />
          </ButtonBase>
        </Row>
        <Row>
          <CaseActionDetailFont style={{ marginRight: 20 }}>Added: 4/30/2020</CaseActionDetailFont>
          <CaseActionDetailFont style={{ marginRight: 20 }}>Counselor: Jana Kleitsch</CaseActionDetailFont>
          <CaseActionDetailFont>Supervisor: Nick Hurlburt</CaseActionDetailFont>
        </Row>
      </Box>
    </CaseContainer>
  );
};

AddNote.displayName = 'AddNote';
AddNote.propTypes = {
  onClickClose: PropTypes.func.isRequired,
};

export default AddNote;
