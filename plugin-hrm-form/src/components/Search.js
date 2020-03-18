import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container } from '../Styles/HrmStyles';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { withConfiguration } from '../ConfigurationContext';
import { searchContacts } from '../services/ContactService';

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    hrmBaseUrl: PropTypes.string.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    results: [],
  };

  handleSearch = async searchParams => {
    const { hrmBaseUrl } = this.props;
    const results = await searchContacts(hrmBaseUrl, searchParams);
    this.setState({ results });
  };

  render() {
    return (
      <Container>
        <SearchForm handleSearch={this.handleSearch} />
        <SearchResults results={this.state.results} handleSelectSearchResult={this.props.handleSelectSearchResult} />
      </Container>
    );
  }
}

export default withConfiguration(Search);
