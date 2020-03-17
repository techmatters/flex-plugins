import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Container } from '../Styles/HrmStyles';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { searchContacts } from '../states/SearchContact';

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    helpline: PropTypes.string.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    results: [],
  };

  handleSearch = async ({ firstName, lastName, counselor, phoneNumber, dateFrom, dateTo, singleInput }) => {
    const { helpline } = this.props;
    const results = await searchContacts({
      helpline,
      firstName,
      lastName,
      counselor,
      phoneNumber,
      dateFrom,
      dateTo,
      singleInput,
    });
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

const mapStateToProps = state => {
  return {
    helpline: state.flex.worker.attributes.helpline,
  };
};

export default connect(mapStateToProps)(Search);
