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

/* eslint-disable react/prop-types */
import React from 'react';

import { Row } from '../../../styles';
import { StyledBackButton } from '../../../styles/buttons';
import { BackText, BackIcon } from '../styles';

type OwnProps = {
  text: JSX.Element | string;
  handleBack: () => void;
};

type Props = OwnProps;

const SearchResultsBackButton: React.FC<Props> = ({ text, handleBack }) => {
  return (
    <Row className="hiddenWhenEditingContact">
      <StyledBackButton onClick={handleBack}>
        <Row>
          <BackIcon />
          <BackText>{text}</BackText>
        </Row>
      </StyledBackButton>
    </Row>
  );
};

SearchResultsBackButton.displayName = 'SearchResultsBackButton';

export default SearchResultsBackButton;
