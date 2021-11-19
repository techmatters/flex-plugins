import React from 'react';
import PropTypes from 'prop-types';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont, CaseAddButton as CaseAddButtonStyled } from '../../styles/case';
import HrmTheme from '../../styles/HrmTheme';

const CaseAddButton = ({ disabled, templateCode, onClick, withDivider }) => {
  const color = disabled ? HrmTheme.colors.disabledColor : 'initial';

  return (
    <CaseAddButtonStyled disabled={disabled} onClick={onClick}>
      <Add style={{ marginRight: 10, fontSize: 16, height: 17, color }} />
      <CaseAddButtonFont style={{ marginRight: 20 }} disabled={disabled}>
        <Template code={templateCode} />
      </CaseAddButtonFont>
    </CaseAddButtonStyled>
  );
};

CaseAddButton.displayName = 'CaseAddButton';
CaseAddButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  templateCode: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  withDivider: PropTypes.bool,
};
CaseAddButton.defaultProps = {
  withDivider: false,
};

export default CaseAddButton;
