import React from 'react';
import PropTypes from 'prop-types';
import { Template } from '@twilio/flex-ui';

import { CaseSectionFont, CaseSummaryTextArea } from '../../styles/case';

const CaseSummary = ({ summary, onChange, onBlur }) => {
  return (
    <>
      <CaseSectionFont id="Case-CaseSummary-label">
        <Template code="Case-CaseSummarySection" />
      </CaseSectionFont>
      <CaseSummaryTextArea
        data-testid="Case-CaseSummary-TextArea"
        aria-labelledby="Case-CaseSummary-label"
        // rows={5}
        value={summary}
        onChange={onChange}
        onBlur={onBlur}
      />
    </>
  );
};

CaseSummary.displayName = 'CaseSummary';
CaseSummary.propTypes = {
  summary: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
};

export default CaseSummary;
