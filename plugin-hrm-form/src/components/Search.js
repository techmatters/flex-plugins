import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import ContactDetails from './ContactDetails';
import { withConfiguration } from '../ConfigurationContext';
import { contextObject, contactType, searchResultType, searchFormType } from '../types';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  SearchPages,
} from '../states/SearchContact';
import { namespace, searchContactsBase } from '../states';

const Search = props => {
  const handleSearch = searchParams => {
    const { hrmBaseUrl } = props.context;
    props.searchContacts(hrmBaseUrl, searchParams);
  };

  const goToForm = () => props.changeSearchPage('form');
  const goToResults = () => props.changeSearchPage('results');

  const { currentPage, currentContact, searchResult, isRequesting, error, form } = props;
  console.log({ isRequesting, error });

  switch (currentPage) {
    case SearchPages.form:
      return (
        <SearchForm values={form} handleSearchFormChange={props.handleSearchFormChange} handleSearch={handleSearch} />
      );
    case SearchPages.results:
      return (
        <SearchResults
          results={searchResult}
          handleSelectSearchResult={props.handleSelectSearchResult}
          handleBack={goToForm}
          handleViewDetails={props.viewContactDetails}
        />
      );
    case SearchPages.details:
      return <ContactDetails contact={currentContact} handleBack={goToResults} />;
    default:
      return null;
  }
};

Search.displayName = 'Search';
Search.propTypes = {
  context: contextObject.isRequired,
  handleSelectSearchResult: PropTypes.func.isRequired,
  handleSearchFormChange: PropTypes.func.isRequired,
  searchContacts: PropTypes.func.isRequired,
  changeSearchPage: PropTypes.func.isRequired,
  viewContactDetails: PropTypes.func.isRequired,
  currentPage: PropTypes.oneOf(Object.keys(SearchPages)).isRequired,
  currentContact: contactType,
  form: searchFormType.isRequired,
  searchResult: PropTypes.arrayOf(searchResultType).isRequired,
  isRequesting: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Error),
};
Search.defaultProps = {
  currentContact: null,
  error: null,
};

const mapStateToProps = state => {
  const searchContactsState = state[namespace][searchContactsBase];

  return {
    currentPage: searchContactsState.currentPage,
    currentContact: searchContactsState.currentContact,
    form: searchContactsState.form,
    searchResult: searchContactsState.searchResult,
    isRequesting: searchContactsState.isRequesting,
    error: searchContactsState.error,
  };
};

const mapDispatchToProps = dispatch => ({
  handleSearchFormChange: bindActionCreators(handleSearchFormChange, dispatch),
  changeSearchPage: bindActionCreators(changeSearchPage, dispatch),
  viewContactDetails: bindActionCreators(viewContactDetails, dispatch),
  searchContacts: searchContacts(dispatch),
});

export default withConfiguration(connect(mapStateToProps, mapDispatchToProps)(Search));
