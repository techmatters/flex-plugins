import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { List } from '@material-ui/core';

// import SearchResultDetails from './SearchResultDetails';
import ContactPreview from './search/ContactPreview';
import { searchContactResult } from '../types';

class SearchResults extends Component {
  static displayName = 'SearchResults';

  static propTypes = {
    results: PropTypes.arrayOf(searchContactResult).isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    selectedSumary: '',
  };

  closeDialog = () => this.setState({ selectedSumary: '' });

  handleClickSummary = selectedSumary => this.setState({ selectedSumary });

  renderSummaryDialog() {
    const isOpen = Boolean(this.state.selectedSumary);

    return (
      <Dialog onClose={this.closeDialog} open={isOpen}>
        <DialogTitle id="simple-dialog-title">Selected Summary</DialogTitle>
        <DialogContent>{this.state.selectedSumary}</DialogContent>
      </Dialog>
    );
  }

  render() {
    if (this.props.results.length === 0) {
      return null;
    }

    // TODO (Gian): This should be a virtualized list instead (for performance reasons)
    return (
      <>
        <List>
          {this.renderSummaryDialog()}
          {this.props.results.map(contact => (
            <ContactPreview
              key={contact.contactId}
              contact={contact}
              onClick={this.handleClickSummary}
              handleConnect={this.props.handleSelectSearchResult}
            />
          ))}
        </List>
      </>
    );
  }
}

export default SearchResults;
