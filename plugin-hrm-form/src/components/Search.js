import React, { Component } from 'react';

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
      notes: 'The child needs help',
    },
    details: {
      childInformation: {
        firstName: 'Jill',
        lastName: 'Smith',
        gender: 'Male',
        age: '10-12',
        language: 'Language 1',
        nationality: 'Nationality 1',
        ethnicity: 'Ethnicity 1',
        refugee: false,
        streetAddress: 'Howard St',
        city: 'San Francisco',
        stateOrCountry: 'CA',
        postalCode: '94105',
        phone1: '415-555-0155',
        phone2: '415-555-0158',
      },
      caseInformation: {
        callSummary: 'Lorem ipsum summary',
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
      notes: 'Young woman with HIV',
    },
    details: {
      childInformation: {
        firstName: 'Sarah',
        lastName: 'Park',
        gender: 'Female',
        age: '18-25',
        language: 'Language 2',
        nationality: 'Nationality 2',
        ethnicity: 'Ethnicity 2',
        refugee: true,
        streetAddress: 'Main St',
        city: 'San Francisco',
        stateOrCountry: 'CA',
        postalCode: '94205',
        phone1: '415-565-0255',
        phone2: '415-565-0258',
      },
      caseInformation: {
        callSummary: 'Lorem ipsum summary 2',
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

  state = {
    results: [],
  };

  handleSearch = ({ firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time }) => {
    console.log('>>> Search: ');
    console.log({ firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time });
    this.setState({ results });
  };

  render() {
    return (
      <>
        <SearchForm handleSearch={this.handleSearch} />
        <SearchResults results={this.state.results} />
      </>
    );
  }
}

export default Search;
