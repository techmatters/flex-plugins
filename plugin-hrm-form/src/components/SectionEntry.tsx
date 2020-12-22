import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import { Template } from '@twilio/flex-ui';

import { SectionDescriptionText, SectionValueText } from '../styles/search';

/**
 * @param {string | number | boolean} value The value for a particular SectionEntry
 */
const resolveValue = value => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') {
    if (value) return <Template code="SectionEntry-Yes" />;
    return <Template code="SectionEntry-No" />;
  }
  return '-';
};

const SectionEntry = ({ description, value, notBold }) => {
  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <SectionDescriptionText>{description}</SectionDescriptionText>
      </Grid>
      <Grid item xs={6}>
        <SectionValueText notBold={notBold}>{resolveValue(value)}</SectionValueText>
      </Grid>
    </Grid>
  );
};

SectionEntry.displayName = 'SectionEntry';

SectionEntry.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]).isRequired,
  notBold: PropTypes.bool,
};

SectionEntry.defaultProps = {
  notBold: false,
};

export default SectionEntry;
