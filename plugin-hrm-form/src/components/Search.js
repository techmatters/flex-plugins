import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import ContactDetails from './ContactDetails';
import { withConfiguration } from '../ConfigurationContext';
import { contextObject } from '../types';
import { searchContacts } from '../services/ContactService';

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    context: contextObject.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    results: [],
    currentPage: 'form',
    currentContact: null,
  };

  handleSearch = async searchParams => {
    const { hrmBaseUrl } = this.props.context;
    const results = await searchContacts(hrmBaseUrl, searchParams);
    this.setState({ results }, this.goToResults);
  };

  changeCurrentPage = currentPage => this.setState({ currentPage });

  goToForm = () => this.changeCurrentPage('form');

  goToResults = () => this.changeCurrentPage('results');

  viewDetails = currentContact => this.setState({ currentContact }, () => this.changeCurrentPage('details'));

  render() {
    const { currentPage, currentContact } = this.state;

    switch (currentPage) {
      case 'form':
        return <SearchForm handleSearch={this.handleSearch} />;
      case 'results':
        return (
          <SearchResults
            results={this.state.results}
            handleSelectSearchResult={this.props.handleSelectSearchResult}
            handleBack={this.goToForm}
            handleViewDetails={this.viewDetails}
          />
        );
      case 'details':
        return <ContactDetails contact={currentContact} handleBack={this.goToResults} />;
      default:
        return null;
    }
  }
}

export default withConfiguration(Search);
