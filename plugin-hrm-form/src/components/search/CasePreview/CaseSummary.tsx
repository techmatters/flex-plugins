/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';

import { CaseSummaryContainer, StyledLink } from '../../../styles/search';

type OwnProps = {
  summary?: string;
};

type Props = OwnProps;

const CaseSummary: React.FC<Props> = ({ summary }) => {
  const [readMore, setReadMore] = useState(false);

  const toggleHideShow = () => {
    setReadMore(!readMore);
  };

  const shortSummary = summary && summary.length > 80 ? `${summary.slice(0, 80).toString()}...` : summary;

  return (
    <CaseSummaryContainer>
      {summary ? (
        <>
          <p>{readMore ? summary : shortSummary}</p>
          <StyledLink onClick={toggleHideShow}>
            <Template code={readMore ? 'CaseSummary-ReadLess' : 'CaseSummary-ReadMore'} />
          </StyledLink>
        </>
      ) : (
        <Template code="CaseSummary-NoSummaryProvided" />
      )}
    </CaseSummaryContainer>
  );
};

CaseSummary.displayName = 'CaseSummary';

export default CaseSummary;
