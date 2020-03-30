import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse } from '@material-ui/core';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';

import { CategoryTitleContainer, CategoryTitleText, ContactDetailsIcon } from '../../../Styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowUpIcon = ContactDetailsIcon(ArrowDropUpTwoTone);

class Category extends React.Component {
  static displayName = 'Category';

  static propTypes = {
    category: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  };

  state = {
    expanded: false,
  };

  handleExpandClick = () => {
    this.setState(prevState => ({
      expanded: !prevState.expanded,
    }));
  };

  render() {
    return (
      <>
        <CategoryTitleContainer>
          <CategoryTitleText>{this.props.category.toUpperCase()}</CategoryTitleText>
          <Button size="small" style={{ padding: 0 }} onClick={this.handleExpandClick}>
            {this.state.expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </Button>
        </CategoryTitleContainer>
        <Collapse in={this.state.expanded} timeout="auto">
          {this.props.children}
        </Collapse>
      </>
    );
  }
}

export default Category;
