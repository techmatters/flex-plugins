import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container } from '../Styles/HrmStyles';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { searchContacts } from '../states/SearchContact';

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    results: [],
  };

  handleSearch = async ({ firstName, lastName, counselor, phoneNumber, dateFrom, dateTo }) => {
    const results = await searchContacts({ firstName, lastName, counselor, phoneNumber, dateFrom, dateTo });
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

export default Search;
