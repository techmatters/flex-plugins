import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { Container } from '../../Styles/HrmStyles';
import { withConfiguration } from '../../ConfigurationContext';
import { contextObject } from '../../types';
import { searchContacts } from '../../services/ContactService';
import { populateCounselors } from '../../services/ServerlessService';

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    context: contextObject.isRequired,
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    counselors: [],
    counselorsHash: {},
    results: [],
  };

  async componentDidMount() {
    try {
      const { context } = this.props;
      const counselors = await populateCounselors(context);
      const counselorsHash = counselors.reduce(
        (obj, counselor) => ({
          ...obj,
          [counselor.sid]: counselor.fullName,
        }),
        {},
      );
      this.setState({ counselors, counselorsHash });
    } catch (err) {
      // TODO (Gian): probably we need to handle this in a nicer way
      console.error(err.message);
    }
  }

  handleSearch = async searchParams => {
    const { hrmBaseUrl } = this.props.context;
    const results = await searchContacts(hrmBaseUrl, searchParams);
    const withCounselors = results.map(contact => {
      const counselor = this.state.counselorsHash[contact.overview.counselor] || 'Unknown';
      const withCounselor = { ...contact, counselor };
      return withCounselor;
    });
    this.setState({ results: withCounselors });
  };

  render() {
    return (
      <Container>
        <SearchForm counselors={this.state.counselors} handleSearch={this.handleSearch} />
        <SearchResults results={this.state.results} handleSelectSearchResult={this.props.handleSelectSearchResult} />
      </Container>
    );
  }
}

export default withConfiguration(Search);
