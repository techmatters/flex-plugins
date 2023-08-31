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

/* eslint-disable react/require-default-props */
import React from 'react';

import { StyledButton } from './styles';
import { useLocalization } from '../localization';

type OwnProps = {
  label: string;
  disabled: boolean;
};

type Props = OwnProps;

const SubmitButton: React.FC<Props> = ({ label, disabled }) => {
  const { getLabel } = useLocalization();

  return (
    <div>
      <StyledButton type="submit" disabled={disabled}>
        {getLabel(label)}
      </StyledButton>
    </div>
  );
};

export default SubmitButton;
