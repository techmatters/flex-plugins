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
import { Add } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { CaseAddButtonFont, CaseAddButton as CaseAddButtonStyled } from './styles';
import HrmTheme from '../../styles/HrmTheme';

type Props = {
  disabled: boolean;
  templateCode: string;
  onClick: () => void;
  withDivider?: boolean;
};

const CaseAddButton: React.FC<Props> = ({ disabled, templateCode, onClick, withDivider = false }) => {
  const color = disabled ? HrmTheme.colors.disabledColor : 'initial';
  return (
    <CaseAddButtonStyled
      disabled={disabled}
      onClick={onClick}
      data-testid={`${templateCode}-AddButton`}
      withDivider={withDivider}
    >
      {!disabled && (
        <>
          <Add style={{ marginLeft: 20, marginRight: 10, fontSize: 16, height: 17, color }} />
          <CaseAddButtonFont disabled={disabled}>
            <Template code={templateCode} />
          </CaseAddButtonFont>
        </>
      )}
    </CaseAddButtonStyled>
  );
};

CaseAddButton.displayName = 'CaseAddButton';

export default CaseAddButton;
