import React from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

const handleSearch = async ({ firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time }) => {
  console.log('>>> Search: ');
  console.log({ firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time })
  return results;
};

const results = [
  {
    name: {
      firstName: 'Jill',
      lastName: 'Smith',
    },
    gender: 'Male',
    age: '10-12',
    language: 'Language 1',
    nationality: 'Nationality 1',
    ethnicity: 'Ethnicity 1',
    school: {
      name: 'State School',
      gradeLevel: 'First grade',
    },
    location: {
      streetAddress: 'Howard St',
      city: 'San Francisco',
      stateOrCountry: 'CA',
      postalCode: '94105',
      phone1: '415-555-0155',
      phone2: '415-555-0158',
    },
    refugee: false,
    disabledOrSpecialNeeds: false,
    hiv: false,
    callSummary: 'The child needs help',
  },
  {
    name: {
      firstName: 'Sarah',
      lastName: 'Park',
    },
    gender: 'Female',
    age: '18-25',
    language: 'Language 2',
    nationality: 'Nationality 2',
    ethnicity: 'Ethnicity 2',
    school: {
      name: 'Federal School',
      gradeLevel: 'Eighth grade',
    },
    location: {
      streetAddress: 'Mission St',
      city: 'San Francisco',
      stateOrCountry: 'CA',
      postalCode: '94105',
      phone1: '415-555-0260',
      phone2: '415-555-0265',
    },
    refugee: false,
    disabledOrSpecialNeeds: false,
    hiv: true,
    callSummary: 'Young woman with HIV',
  },
];

const Search = () =>
  <div>
    <SearchForm handleSearch={handleSearch} />
    <SearchResults results={results} />
  </div>;

export default Search;