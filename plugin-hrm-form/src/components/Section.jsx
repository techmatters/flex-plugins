import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, Collapse } from '@material-ui/core';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';

import { SectionTitleContainer, SectionTitleText, ContactDetailsIcon } from '../styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowUpIcon = ContactDetailsIcon(ArrowDropUpTwoTone);

const Section = ({ color, sectionTitle, expanded, children, handleExpandClick }) => (
  <>
    <SectionTitleContainer color={color}>
      <ButtonBase style={{ width: '100%', padding: 0 }} onClick={handleExpandClick}>
        <SectionTitleText>{sectionTitle.toUpperCase()}</SectionTitleText>
        {expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
      </ButtonBase>
    </SectionTitleContainer>
    <Collapse in={expanded} timeout="auto">
      {children}
    </Collapse>
  </>
);

Section.displayName = 'Section';
Section.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  expanded: PropTypes.bool,
  handleExpandClick: PropTypes.func.isRequired,
};
Section.defaultProps = {
  expanded: false,
};

export default Section;
