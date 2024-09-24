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
import { CircularProgress } from '@material-ui/core';

import { StyledButton } from './styles';
import { Flex } from '../../styles';

export type Props = {
  label: string;
  variant: 'primary' | 'secondary' | 'destructive';
  size: 'small' | 'medium' | 'large';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  disabled: boolean;
  isLoading?: boolean;
  onClick: (() => void) | (() => Promise<void>);
};

const getSpinnerSize = (size: Props['size']) => {
  switch (size) {
    case 'small':
      return 15;
    case 'medium':
      return 16;
    case 'large':
      return 18;
    default:
      return 16;
  }
};

export const Button: React.FC<Props> = ({
  label,
  variant,
  size = 'medium',
  iconLeft,
  iconRight,
  disabled,
  isLoading = false,
  onClick,
}) => (
  <StyledButton type="button" variant={variant} size={size} disabled={disabled} onClick={onClick}>
    <Flex flexDirection="column" alignItems="center">
      <Flex style={{ alignItems: 'center', opacity: isLoading ? 0 : 1, height: isLoading ? 0 : 'auto' }}>
        {iconLeft}
        {label}
        {iconRight}
      </Flex>
      {isLoading && <CircularProgress size={getSpinnerSize(size)} color="inherit" />}
    </Flex>
  </StyledButton>
);