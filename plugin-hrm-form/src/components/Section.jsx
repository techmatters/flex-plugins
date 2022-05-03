import React from 'react';
import PropTypes from 'prop-types';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import {
  SectionTitleContainer,
  SectionTitleButton,
  SectionTitleText,
  SectionCollapse,
  ContactDetailsIcon,
} from '../styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowUpIcon = ContactDetailsIcon(ArrowDropUpTwoTone);

const Section = ({
  color,
  sectionTitle,
  expanded,
  hideIcon,
  children,
  handleExpandClick,
  buttonDataTestid,
  htmlElRef,
  showEditButton,
  handleEditClick,
}) => (
  <>
    <SectionTitleContainer color={color}>
      <SectionTitleButton
        buttonRef={buttonRef => {
          if (htmlElRef) {
            htmlElRef.current = buttonRef;
          }
        }}
        onClick={handleExpandClick}
        data-testid={buttonDataTestid}
      >
        <SectionTitleText>{sectionTitle}</SectionTitleText>
        {!hideIcon && (expanded ? <ArrowUpIcon /> : <ArrowDownIcon />)}
      </SectionTitleButton>
      {showEditButton && (
        <button type="button" onClick={handleEditClick}>
          <Template code="EditButton" />
        </button>
      )}
    </SectionTitleContainer>
    <SectionCollapse expanded={expanded} timeout="auto">
      {children}
    </SectionCollapse>
  </>
);

Section.displayName = 'Section';
Section.propTypes = {
  sectionTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  color: PropTypes.string,
  children: PropTypes.node.isRequired,
  expanded: PropTypes.bool,
  hideIcon: PropTypes.bool,
  handleExpandClick: PropTypes.func.isRequired,
  buttonDataTestid: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  htmlElRef: PropTypes.any,
  showEditButton: PropTypes.bool,
  handleEditClick: PropTypes.func,
};
Section.defaultProps = {
  expanded: false,
  hideIcon: false,
  color: null,
  buttonDataTestid: null,
  htmlElRef: null,
};

export default Section;
