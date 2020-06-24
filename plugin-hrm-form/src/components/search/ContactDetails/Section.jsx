import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, Collapse } from '@material-ui/core';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';

import { SectionTitleContainer, SectionTitleText, ContactDetailsIcon } from '../../../styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowUpIcon = ContactDetailsIcon(ArrowDropUpTwoTone);

class Section extends React.Component {
  static displayName = 'Section';

  static propTypes = {
    sectionTitle: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    expanded: PropTypes.bool,
  };

  static defaultProps = {
    expanded: false,
  };

  state = {
    expanded: this.props.expanded, // receive from props only when component is initialized
  };

  handleExpandClick = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded,
    }));
  };

  render() {
    return (
      <>
        <SectionTitleContainer color={this.props.color}>
          <ButtonBase style={{ width: '100%', padding: 0 }} onClick={this.handleExpandClick}>
            <SectionTitleText>{this.props.sectionTitle.toUpperCase()}</SectionTitleText>
            {this.state.expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </ButtonBase>
        </SectionTitleContainer>
        <Collapse in={this.state.expanded} timeout="auto">
          {this.props.children}
        </Collapse>
      </>
    );
  }
}

export default Section;
