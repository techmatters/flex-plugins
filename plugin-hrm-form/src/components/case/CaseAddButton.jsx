import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont } from '../../styles/case';

const CaseAddButton = ({ templateCode, onClick }) => {
  return (
    <ButtonBase onClick={onClick} style={{ marginLeft: 'auto' }}>
      <Add style={{ marginRight: 10 }} />
      <CaseAddButtonFont style={{ marginRight: 20 }}>
        <Template code={templateCode} />
      </CaseAddButtonFont>
    </ButtonBase>
  );
};

CaseAddButton.displayName = 'CaseAddButton';
CaseAddButton.propTypes = {
  templateCode: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default CaseAddButton;
