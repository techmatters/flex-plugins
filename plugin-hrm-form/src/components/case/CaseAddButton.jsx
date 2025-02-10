/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont, CaseAddButton as CaseAddButtonStyled } from './styles';
import HrmTheme from '../../styles/HrmTheme';

const CaseAddButton = ({ disabled, templateCode, onClick }) => {
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
