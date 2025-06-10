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

import styled from '@emotion/styled';
import { Paper, FormControl } from '@material-ui/core';

import { Box } from '../../styles';

export const ModalPaper = styled(Paper)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 700px;
  width: 90%;
  background-color: white;
  padding: 20px;
  outline: none;
  border-radius: 4px;
`;

export const ModalTitle = styled('h2')`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

export const CloseButtonWrapper = styled(Box)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const HeaderBox = styled(Box)`
  margin-bottom: 20px;
`;

export const QueueGridContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 30px;
  margin: 0 10px;
  padding: 10px 0;
  width: 100%;
`;

export const QueueOption = styled.div<{ selected: boolean }>`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const RadioCircle = styled('div')`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #000;
  margin-right: 8px;
  position: relative;
  background-color: white;
`;

export const RadioDot = styled('div')`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #000;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const QueueOptionLabel = styled('label')`
  cursor: pointer;
`;

export const HiddenInput = styled('input')`
  position: absolute;
  opacity: 0;
`;

export const ButtonGroup = styled(Box)`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

export const StyledFormControl = styled(FormControl)`
  width: 100%;
`;

export const DialogContainer = styled('div')`
  position: relative;
  max-width: 500px;
  padding: 20px;
`;

export const DialogTitle = styled('h2')`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  max-width: 80%;
  text-align: center;
`;

export const StatusTextContainer = styled(Box)`
  margin: 20px;
`;

const SWITCHBOARD_TILE_COLORS = {
  active: {
    border: '#f8c000',
    background: '#fff7de',
  },
  inactive: {
    border: '#e1e3ea',
    background: 'transparent',
  },
};

export const SwitchboardTileBox = styled(Box)<{ isActive?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 20px;
  border: 2px solid
    ${props => (props.isActive ? SWITCHBOARD_TILE_COLORS.active.border : SWITCHBOARD_TILE_COLORS.inactive.border)};
  border-radius: 4px;
  background-color: ${props =>
    props.isActive ? SWITCHBOARD_TILE_COLORS.active.background : SWITCHBOARD_TILE_COLORS.inactive.background};
  font-family: 'Open Sans';
  position: relative;
`;

export const LoadingContainer = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 1;
  border-radius: 4px;
`;
