import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Container } from '../Styles/HrmStyles';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

const results = [
  {
    contactId: 'aaa',
    overview: {
      dateTime: 'Jan 2, 2020 10:14',
      name: 'Jill Smith',
      customerNumber: '3120765',
      callType: 'Self',
      categories: 'Category 1: Sub 1',
      counselor: 'Lisa',
      callSummary:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet consectetur adipiscing elit ut aliquam purus sit. Egestas fringilla phasellus faucibus scelerisque eleifend. Faucibus scelerisque eleifend donec pretium vulputate sapien nec sagittis.',
    },
    details: {
      childInformation: {
        name: {
          firstName: 'Jill',
          lastName: 'Smith',
        },
        gender: 'Male',
        age: '10-12',
        language: 'Language 1',
        nationality: 'Nationality 1',
        ethnicity: 'Ethnicity 1',
        location: {
          streetAddress: 'Howard St',
          city: 'San Francisco',
          stateOrCounty: 'CA',
          postalCode: '94105',
          phone1: '415-555-0155',
          phone2: '415-555-0158',
        },
        refugee: false,
      },
      caseInformation: {
        callSummary:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sit amet consectetur adipiscing elit ut aliquam purus sit. Egestas fringilla phasellus faucibus scelerisque eleifend. Faucibus scelerisque eleifend donec pretium vulputate sapien nec sagittis.',
        referredTo: 'Referral 1',
        status: 'In Progress',
        keepConfidential: false,
        okForCaseWorkerToCall: true,
        howDidTheChildHearAboutUs: 'Media',
        didYouDiscussRightsWithTheChild: true,
        didTheChildFeelWeSolvedTheirProblem: true,
        wouldTheChildRecommendUsToAFriend: true,
      },
    },
  },
  {
    contactId: 'bbb',
    overview: {
      dateTime: 'Jan 15, 2020 09:30',
      name: 'Sarah Park',
      customerNumber: '4546311',
      callType: 'Self',
      categories: 'Category 1: Sub 2',
      counselor: 'Jim',
      callSummary:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tempor orci dapibus ultrices in iaculis nunc sed augue. Consequat nisl vel pretium lectus.',
    },
    details: {
      childInformation: {
        name: {
          firstName: 'Sarah',
          lastName: 'Park',
        },
        gender: 'Female',
        age: '18-25',
        language: 'Language 2',
        nationality: 'Nationality 2',
        ethnicity: 'Ethnicity 2',
        location: {
          streetAddress: 'Main St',
          city: 'San Francisco',
          stateOrCounty: 'CA',
          postalCode: '94205',
          phone1: '415-565-0255',
          phone2: '415-565-0258',
        },
        refugee: true,
      },
      caseInformation: {
        callSummary:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tempor orci dapibus ultrices in iaculis nunc sed augue. Consequat nisl vel pretium lectus.',
        referredTo: 'Referral 2',
        status: 'Open',
        keepConfidential: true,
        okForCaseWorkerToCall: false,
        howDidTheChildHearAboutUs: 'Word of Mouth',
        didYouDiscussRightsWithTheChild: false,
        didTheChildFeelWeSolvedTheirProblem: false,
        wouldTheChildRecommendUsToAFriend: true,
      },
    },
  },
];

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    handleSelectSearchResult: PropTypes.func.isRequired,
  };

  state = {
    results: [],
  };

  handleSearch = ({ firstName, lastName, counselor, phoneNumber, dateFrom, dateTo }) => {
    console.log('>>> Search: ');
    console.log({ firstName, lastName, counselor, phoneNumber, dateFrom, dateTo });
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
