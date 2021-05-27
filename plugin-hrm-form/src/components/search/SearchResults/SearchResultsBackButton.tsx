/* eslint-disable react/prop-types */
import React from 'react';

import { Row, StyledBackButton } from '../../../styles/HrmStyles';
import { BackText, BackIcon } from '../../../styles/search';

type OwnProps = {
  text: JSX.Element | string;
  handleBack: () => void;
};

type Props = OwnProps;

const SearchResultsBackButton: React.FC<Props> = ({ text, handleBack }) => {
  return (
    <Row>
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
