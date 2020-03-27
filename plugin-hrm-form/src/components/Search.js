import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import { Container } from '../Styles/HrmStyles';
import { withConfiguration } from '../ConfigurationContext';
import { contextObject } from '../types';
import { searchContacts } from '../services/ContactService';
import { populateCounselors } from '../services/ServerlessService';

/**
 * @param {{
 *  sid: string;
 *  fullName: string;
 *}[]} counselors
 * @returns {{}} an object containing for each counselor,
 * a property with its sid, and as a value the counselor's fullName
 */
const createCounselorsHash = counselors => {
  const hash = counselors.reduce(
    (obj, counselor) => ({
      ...obj,
      [counselor.sid]: counselor.fullName,
    }),
    {},
  );

  return hash;
};

/**
 * @param {any} contact a contact result object
 * @returns {string[]} returns an array conaining the tags of the contact as strings (if any)
 */
const retrieveTags = contact => {
  const { details } = contact;
  if (!details || !details.caseInformation || !details.caseInformation.categories) return [];

  const cats = Object.entries(details.caseInformation.categories);
  const subcats = cats.flatMap(([_, subs]) => Object.entries(subs));

  const flattened = subcats.map(([subcat, bool]) => {
    if (bool) return subcat;
    return null;
  });

  const tags = flattened.reduce((acc, curr) => {
    if (curr) return [...acc, curr];
    return acc;
  }, []);

  return tags;
};

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
      const counselorsHash = createCounselorsHash(counselors);
      this.setState({ counselors, counselorsHash });
    } catch (err) {
      // TODO (Gian): probably we need to handle this in a nicer way
      console.error(err.message);
    }
  }

  addDetails = raw => {
    const detailed = raw.map(contact => {
      const counselor = this.state.counselorsHash[contact.overview.counselor] || 'Unknown';
      const tags = retrieveTags(contact);
      const det = { ...contact, counselor, tags };
      return det;
    });

    return detailed;
  };

  handleSearch = async searchParams => {
    const { hrmBaseUrl } = this.props.context;
    const rawResults = await searchContacts(hrmBaseUrl, searchParams);
    const detailedResults = this.addDetails(rawResults);
    this.setState({ results: detailedResults });
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
