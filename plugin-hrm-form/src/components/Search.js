import React from 'react';
import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

const handleSearch = async ({ firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time }) => {
  console.log('>>> Search: ');
  console.log({ firstName, lastName, counselor, area, phoneNumber, dateFrom, dateTo, time })
  return results;
};

const results = [];

const Search = () =>
  <div>
    <SearchForm handleSearch={handleSearch} />
    <SearchResults results={results} />
  </div>;

export default Search;