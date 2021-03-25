import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont } from '../../styles/case';
import HrmTheme from '../../styles/HrmTheme';

const CaseAddButton = ({ canEditFields, templateCode, onClick, withDivider }) => {
  const disabled = !canEditFields;
  const color = disabled ? HrmTheme.colors.disabledColor : 'initial';

  return (
    <ButtonBase
      disabled={disabled}
      onClick={onClick}
      style={{
        marginLeft: 'auto',
        paddingLeft: withDivider ? '12px' : '0px',
        borderLeft: withDivider ? '1px solid rgba(25, 43, 51, 0.3)' : 'none',
      }}
    >
      <Add style={{ marginRight: 10, color }} />
      <CaseAddButtonFont style={{ marginRight: 20 }} disabled={disabled}>
        <Template code={templateCode} />
      </CaseAddButtonFont>
    </ButtonBase>
  );
};

CaseAddButton.displayName = 'CaseAddButton';
CaseAddButton.propTypes = {
  canEditFields: PropTypes.bool.isRequired,
  templateCode: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  withDivider: PropTypes.bool,
};
CaseAddButton.defaultProps = {
  withDivider: false,
};

export default CaseAddButton;
