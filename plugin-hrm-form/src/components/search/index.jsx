import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import ContactDetails from './ContactDetails';
import { withConfiguration } from '../../ConfigurationContext';
import { contextObject, contactType, searchResultType, searchFormType } from '../../types';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  SearchPages,
} from '../../states/SearchContact';
import { namespace, searchContactsBase } from '../../states';
import { populateCounselors } from '../../services/ServerlessService';

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

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    context: contextObject.isRequired,
    currentIsCaller: PropTypes.bool,
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

  static defaultProps = {
    currentIsCaller: false,
    currentContact: null,
    error: null,
  };

  state = {
    mockedMessage: '',
    counselors: [],
    counselorsHash: {},
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

  closeDialog = () => this.setState({ mockedMessage: '' });

  handleMockedMessage = mockedMessage => this.setState({ mockedMessage: 'Not implemented yet!' });

  renderMockDialog() {
    const isOpen = Boolean(this.state.mockedMessage);

    return (
      <Dialog onClose={this.closeDialog} open={isOpen}>
        <DialogContent>{this.state.mockedMessage}</DialogContent>
      </Dialog>
    );
  }

  handleSearch = async searchParams => {
    const { hrmBaseUrl } = this.props.context;
    this.props.searchContacts(hrmBaseUrl, searchParams, this.state.counselorsHash);
  };

  goToForm = () => this.props.changeSearchPage('form');

  goToResults = () => this.props.changeSearchPage('results');

  renderSearchPages(currentPage, currentContact, searchResult, form, counselors) {
    switch (currentPage) {
      case SearchPages.form:
        return (
          <SearchForm
            counselors={counselors}
            values={form}
            handleSearchFormChange={this.props.handleSearchFormChange}
            handleSearch={this.handleSearch}
          />
        );
      case SearchPages.results:
        return (
          <SearchResults
            currentIsCaller={this.props.currentIsCaller}
            results={searchResult}
            handleSelectSearchResult={this.props.handleSelectSearchResult}
            handleBack={this.goToForm}
            handleViewDetails={this.props.viewContactDetails}
            handleMockedMessage={this.handleMockedMessage}
          />
        );
      case SearchPages.details:
        return (
          <ContactDetails
            contact={currentContact}
            handleBack={this.goToResults}
            handleMockedMessage={this.handleMockedMessage}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { currentPage, currentContact, searchResult, isRequesting, error, form } = this.props;
    const { counselors } = this.state;
    console.log({ isRequesting, error });

    return (
      <>
        {this.renderMockDialog()}
        {this.renderSearchPages(currentPage, currentContact, searchResult, form, counselors)}
      </>
    );
  }
}

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
