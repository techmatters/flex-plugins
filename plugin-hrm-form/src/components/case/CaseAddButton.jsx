import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont } from '../../styles/case';

const CaseAddButton = ({ templateCode, onClick, withDivider }) => {
  return (
    <ButtonBase
      onClick={onClick}
      style={{
        marginLeft: 'auto',
        paddingLeft: withDivider ? '12px' : '0px',
        borderLeft: withDivider ? '1px solid rgba(25, 43, 51, 0.3)' : 'none',
      }}
    >
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
  withDivider: PropTypes.bool,
};
CaseAddButton.defaultProps = {
  withDivider: false,
};

export default CaseAddButton;
