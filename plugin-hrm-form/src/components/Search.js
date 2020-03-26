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
const cnslrsHash = counselors => {
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
  const subcats = cats.map(c => [c[0], Object.entries(c[1])]);
  const flattened = subcats.flatMap(s => {
    const cat = s[0];
    const f = s[1].flatMap(pair => {
      const [subcat, bool] = pair;
      if (bool) return cat + subcat; // remove cat if prefix is not needed anymore
      return null;
    });

    return f;
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
      const counselorsHash = cnslrsHash(counselors);
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
