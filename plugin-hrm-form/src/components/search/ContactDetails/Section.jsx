import React from 'react';
import PropTypes from 'prop-types';
import { ButtonBase, Collapse } from '@material-ui/core';
import { ArrowDropDownTwoTone, ArrowDropUpTwoTone } from '@material-ui/icons';

import SectionEntry from './SectionEntry';
import { SectionTitleContainer, SectionTitleText, ContactDetailsIcon } from '../../../Styles/search';

const ArrowDownIcon = ContactDetailsIcon(ArrowDropDownTwoTone);
const ArrowUpIcon = ContactDetailsIcon(ArrowDropUpTwoTone);

class Section extends React.Component {
  static displayName = 'Section';

  static propTypes = {
    sectionTitle: PropTypes.string.isRequired,
    entries: PropTypes.arrayOf(
      PropTypes.shape({
        description: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.bool]),
      }),
    ).isRequired,
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

  /**
   * @param {{ description: string, value: string | number | boolean}} entry
   * @param {number} index
   */
  renderSectionEntry = (entry, index) => {
    if (!entry) return null;
    const { description, value } = entry;
    return <SectionEntry key={`${description}${index}`} description={description} value={value} />;
  };

  render() {
    return (
      <>
        <SectionTitleContainer>
          <ButtonBase style={{ width: '100%', padding: 0 }} onClick={this.handleExpandClick}>
            <SectionTitleText>{this.props.sectionTitle.toUpperCase()}</SectionTitleText>
            {this.state.expanded ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </ButtonBase>
        </SectionTitleContainer>
        <Collapse in={this.state.expanded} timeout="auto">
          {this.props.entries.map(this.renderSectionEntry)}
        </Collapse>
      </>
    );
  }
}

export default Section;
