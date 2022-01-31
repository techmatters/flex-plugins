/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/prop-types */
/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import { Template } from '@twilio/flex-ui';

import { CaseSummaryContainer, StyledLink } from '../../../styles/search';

const CHAR_LIMIT = 80;

type OwnProps = {
  summary?: string;
};

type Props = OwnProps;

const CaseSummary: React.FC<Props> = ({ summary }) => {
  const [readMore, setReadMore] = useState(false);

  const toggleHideShow = () => {
    setReadMore(!readMore);
  };

  const showReadMore = summary && summary.length > CHAR_LIMIT;
  const shortSummary =
    summary && summary.length > CHAR_LIMIT ? `${summary.slice(0, CHAR_LIMIT).toString()}...` : summary;

  return (
    <CaseSummaryContainer>
      {summary ? (
        <>
          <p>{readMore ? summary : shortSummary}</p>
          {showReadMore && (
            <StyledLink onClick={toggleHideShow}>
              <Template code={readMore ? 'CaseSummary-ReadLess' : 'CaseSummary-ReadMore'} />
            </StyledLink>
          )}
        </>
      ) : (
        <Template code="CaseSummary-NoSummaryProvided" />
      )}
    </CaseSummaryContainer>
  );
};

CaseSummary.displayName = 'CaseSummary';

export default CaseSummary;
