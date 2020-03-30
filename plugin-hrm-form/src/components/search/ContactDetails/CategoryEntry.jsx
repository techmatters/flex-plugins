import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';

import { CategoryDescriptionText, CategoryValueText } from '../../../Styles/search';

/**
 * @param {string | boolean} value The value for a particular CategoryEntry
 */
const resolveValue = value => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return '-';
};

const CategoryEntry = ({ description, value }) => {
  return (
    <Grid container style={{ marginTop: 8, marginBottom: 8 }}>
      <Grid item xs={6}>
        <CategoryDescriptionText>{description}</CategoryDescriptionText>
      </Grid>
      <Grid item xs={6}>
        <CategoryValueText>{resolveValue(value)}</CategoryValueText>
      </Grid>
    </Grid>
  );
};

CategoryEntry.displayName = 'CategoryEntry';

CategoryEntry.propTypes = {
  description: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default CategoryEntry;
