import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonBase, List, Popover } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';

import ContactPreview from '../ContactPreview';
import { searchResultType } from '../../../types';
import { Row } from '../../../Styles/HrmStyles';
import { ConfirmContainer, ConfirmText, BackIcon, BackText } from '../../../Styles/search';
import callTypes from '../../../states/DomainConstants';

class SearchResults extends Component {
  static displayName = 'SearchResults';

  static propTypes = {
    currentIsCaller: PropTypes.bool.isRequired,
    results: PropTypes.arrayOf(searchResultType).isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
    handleBack: PropTypes.func.isRequired,
    handleViewDetails: PropTypes.func.isRequired,
    handleMockedMessage: PropTypes.func.isRequired,
  };

  state = {
    anchorEl: null,
    contact: null,
    msg: '',
  };

  msgTemplate = w => `Copy ${w} information from this record to new contact?`;

  copyDataOf = contact => {
    if (!contact) return '';
    switch (contact.details.callType) {
      case callTypes.child:
        return this.msgTemplate('child');
      case callTypes.caller:
        if (this.props.currentIsCaller) return this.msgTemplate('caller');
        return this.msgTemplate('child');
      default:
        return '';
    }
  };

  renderConfirmPopover = () => {
    const isOpen = Boolean(this.state.anchorEl);
    const id = isOpen ? 'simple-popover' : undefined;

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
          <ConfirmText>{this.state.msg}</ConfirmText>
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
              yes, copy
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
    this.setState({ anchorEl: e.currentTarget, contact, msg: this.copyDataOf(contact) });
  };

  render() {
    // TODO (Gian): This should be a virtualized list instead (for performance reasons)
    return (
      <>
        <Row>
          <ButtonBase onClick={this.props.handleBack}>
            <BackIcon />
            <BackText>BACK TO SEARCH</BackText>
          </ButtonBase>
        </Row>
        <List>
          {this.renderConfirmPopover()}
          {this.props.results.map(contact => (
            <ContactPreview
              key={contact.contactId}
              contact={contact}
              handleConnect={this.handleConnectConfirm(contact)}
              handleViewDetails={() => this.props.handleViewDetails(contact)}
              handleMockedMessage={this.props.handleMockedMessage}
            />
          ))}
        </List>
      </>
    );
  }
}

export default SearchResults;
