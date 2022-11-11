import React from 'react';
import PropTypes from 'prop-types';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont, CaseAddButton as CaseAddButtonStyled } from '../../styles/case';
import HrmTheme from '../../styles/HrmTheme';

const CaseAddButton = ({ disabled, templateCode, onClick, withDivider }) => {
  const color = disabled ? HrmTheme.colors.disabledColor : 'initial';
  return (
    <CaseAddButtonStyled disabled={disabled} onClick={onClick} data-testid={`${templateCode}-AddButton`}>
      {!disabled && (
        <>
          <Add style={{ marginLeft: 20, marginRight: 10, fontSize: 16, height: 17, color }} />
          <CaseAddButtonFont>
            <Template code={templateCode} />
          </CaseAddButtonFont>
        </>
      )}
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
