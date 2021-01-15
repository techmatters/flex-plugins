import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont } from '../../styles/case';

const CaseAddButton = ({ status, templateCode, onClick, withDivider }) => {
  return (
    <ButtonBase
      disabled={status === 'closed'}
      onClick={onClick}
      style={{
        marginLeft: 'auto',
        paddingLeft: withDivider ? '12px' : '0px',
        borderLeft: withDivider ? '1px solid rgba(25, 43, 51, 0.3)' : 'none',
      }}
    >
      <Add style={{ marginRight: 10 }} />
      <CaseAddButtonFont style={{ marginRight: 20 }} disabled={status === 'closed'}>
        <Template code={templateCode} />
      </CaseAddButtonFont>
    </ButtonBase>
  );
};

CaseAddButton.displayName = 'CaseAddButton';
CaseAddButton.propTypes = {
  status: PropTypes.string.isRequired,
  templateCode: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  withDivider: PropTypes.bool,
};
CaseAddButton.defaultProps = {
  withDivider: false,
};

export default CaseAddButton;
