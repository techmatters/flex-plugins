import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonBase, Popover } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';

import ContactPreview from '../ContactPreview';
import { searchResultType } from '../../../types';
import { Row } from '../../../Styles/HrmStyles';
import {
  ConfirmContainer,
  ConfirmText,
  BackIcon,
  BackText,
  ResultsHeader,
  ListContainer,
  ScrollableList,
} from '../../../Styles/search';

class SearchResults extends Component {
  static displayName = 'SearchResults';

  static propTypes = {
    results: PropTypes.arrayOf(searchResultType).isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    handleViewDetails: PropTypes.func.isRequired,
    handleMockedMessage: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
    contact: null,
  };

  renderConfirmPopover = () => {
    const isOpen = Boolean(this.state.anchorEl);
    const id = isOpen ? 'simple-popover' : undefined;
    const msg = "Connect current caller's record with this record?";

    const handleClose = () => {
      this.setState({ anchorEl: null, contact: null });
    };

    const handleConfirm = () => {
      const { contact } = this.state;
      this.props.handleSelectSearchResult(contact); // no need to clear state as this unmounts
    };

    return (
      <Popover
        id={id}
        open={isOpen}
        onClose={handleClose}
        anchorEl={this.state.anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <ConfirmContainer>
          <ConfirmText>{msg}</ConfirmText>
          <Row>
            <Button variant="text" size="medium" onClick={handleClose}>
              cancel
            </Button>
            <Button
              variant="contained"
              size="medium"
              onClick={handleConfirm}
              style={{ backgroundColor: '#000', color: '#fff', marginLeft: 20 }}
            >
              <CheckIcon />
              yes, connect
            </Button>
          </Row>
        </ConfirmContainer>
      </Popover>
    );
  };

  /**
   * Captures the contact of each preview and the event that fired it
   * so we can "pop over" the pressed button
   * @param {any} contact
   * @returns {(e: React.MouseEvent<HTMLElement, MouseEvent>) => void}
   */
  handleConnectConfirm = contact => e => {
    e.stopPropagation();
    this.setState({ anchorEl: e.currentTarget, contact });
  };

  render() {
    const resultsCount = this.props.results.length;
    // TODO (Gian): This should be a virtualized list instead (for performance reasons)
    return (
      <>
        <ResultsHeader>
          <Row>
            <ButtonBase onClick={this.props.handleBack}>
              <BackIcon />
              <BackText>Return to search criteria</BackText>
            </ButtonBase>
          </Row>
          <Row style={{ paddingLeft: '24px' }}>
            <BackText>
              {resultsCount} result{resultsCount !== 1 && 's'}
            </BackText>
          </Row>
        </ResultsHeader>
        {this.renderConfirmPopover()}
        <ListContainer>
          <ScrollableList>
            {this.props.results.map(contact => (
              <ContactPreview
                key={contact.contactId}
                contact={contact}
                handleConnect={this.handleConnectConfirm(contact)}
                handleViewDetails={() => this.props.handleViewDetails(contact)}
                handleMockedMessage={this.props.handleMockedMessage}
              />
            ))}
          </ScrollableList>
        </ListContainer>
      </>
    );
  }
}

export default SearchResults;
