import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@material-ui/core';

/**
 * Given a category, truncates it (if necessary) to make it fit (aprox) in the space of 'UNSPECIFIED/OTHER' string
 * @param {string} category
 */
export const getTag = category =>
  category.length > 17 && !category.toUpperCase().includes('UNSPECIFIED/OTHER')
    ? `${category.substring(0, 15).trim()}...`
    : category.substring(0, 17).trim();

/**
 * Takes a render function (to render the children) and the category and returns
 * the same element wrapped in a Tooltip, with the category truncated to fit "UNSPECIFIED/OTHER" string
 * @param {{ renderTag: (tag: string, color: string) => JSX.Element; category: string }} props
 */
const CategoryWithTooltip = ({ renderTag, category, color }) => {
  const tag = getTag(category);

  return <Tooltip title={category}>{renderTag(tag, color)}</Tooltip>;
};

CategoryWithTooltip.displayName = 'CategoryWithTooltip';
CategoryWithTooltip.propTypes = {
  renderTag: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  color: PropTypes.string,
};
CategoryWithTooltip.defaultProps = {
  color: '#000000',
};

export default CategoryWithTooltip;
