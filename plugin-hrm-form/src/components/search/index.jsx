import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { withTaskContext } from '@twilio/flex-ui';

import SearchForm from './SearchForm';
import SearchResults, { CONTACTS_PER_PAGE } from './SearchResults';
import ContactDetails from './ContactDetails';
import { contactType, searchResultType, searchFormType } from '../../types';
import { SearchPages } from '../../states/search/types';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  handleExpandDetailsSection,
} from '../../states/search/actions';
import { namespace, searchContactsBase, configurationBase } from '../../states';

class Search extends Component {
  static displayName = 'Search';

  static propTypes = {
    currentIsCaller: PropTypes.bool,
    handleSelectSearchResult: PropTypes.func.isRequired,
    handleSearchFormChange: PropTypes.func.isRequired,
    searchContacts: PropTypes.func.isRequired,
    changeSearchPage: PropTypes.func.isRequired,
    viewContactDetails: PropTypes.func.isRequired,
    handleExpandDetailsSection: PropTypes.func.isRequired,
    currentPage: PropTypes.oneOf(Object.keys({ ...SearchPages })).isRequired,
    currentContact: contactType,
    form: searchFormType.isRequired,
    searchResult: PropTypes.arrayOf(searchResultType).isRequired,
    detailsExpanded: PropTypes.objectOf(PropTypes.bool).isRequired,
    isRequesting: PropTypes.bool.isRequired,
    error: PropTypes.instanceOf(Error),
    counselorsHash: PropTypes.shape({}).isRequired,
  };

  static defaultProps = {
    currentIsCaller: false,
    currentContact: null,
    error: null,
  };

  state = {
    mockedMessage: '',
    searchParams: {},
    offset: 0,
  };

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

  handleSearch = () => {
    const { searchParams, offset } = this.state;
    this.props.searchContacts(searchParams, this.props.counselorsHash, CONTACTS_PER_PAGE, offset);
  };

  setSearchParamsAndHandleSearch = searchParams => {
    this.setState({ searchParams, offset: 0 }, this.handleSearch);
  };

  setOffsetAndHandleSearch = offset => {
    this.setState({ offset }, this.handleSearch);
  };

  toggleNonDataContacts = () => {
    const { searchParams } = this.state;
    const { onlyDataContacts } = searchParams;
    const updatedSearchParams = {
      ...searchParams,
      onlyDataContacts: !onlyDataContacts,
    };
    this.setState({ searchParams: updatedSearchParams, offset: 0 }, this.handleSearch);
  };

  goToForm = () => this.props.changeSearchPage('form');

  goToResults = () => this.props.changeSearchPage('results');

  renderSearchPages(currentPage, currentContact, searchResult, form) {
    switch (currentPage) {
      case SearchPages.form:
        return (
          <SearchForm
            values={form}
            handleSearchFormChange={this.props.handleSearchFormChange}
            handleSearch={this.setSearchParamsAndHandleSearch}
          />
        );
      case SearchPages.results:
        return (
          <SearchResults
            currentIsCaller={this.props.currentIsCaller}
            results={searchResult}
            onlyDataContacts={this.state.searchParams.onlyDataContacts}
            handleSelectSearchResult={this.props.handleSelectSearchResult}
            handleSearch={this.setOffsetAndHandleSearch}
            toggleNonDataContacts={this.toggleNonDataContacts}
            handleBack={this.goToForm}
            handleViewDetails={this.props.viewContactDetails}
            handleMockedMessage={this.handleMockedMessage}
          />
        );
      case SearchPages.details:
        return (
          <ContactDetails
            currentIsCaller={this.props.currentIsCaller}
            contact={currentContact}
            detailsExpanded={this.props.detailsExpanded}
            handleBack={this.goToResults}
            handleSelectSearchResult={this.props.handleSelectSearchResult}
            handleMockedMessage={this.handleMockedMessage}
            handleExpandDetailsSection={this.props.handleExpandDetailsSection}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { currentPage, currentContact, searchResult, isRequesting, error, form } = this.props;
    console.log({ isRequesting, error });

    return (
      <>
        {this.renderMockDialog()}
        {this.renderSearchPages(currentPage, currentContact, searchResult, form)}
      </>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const searchContactsState = state[namespace][searchContactsBase];
  const taskId = ownProps.task.taskSid;
  const taskSearchState = searchContactsState.tasks[taskId];
  const { counselors } = state[namespace][configurationBase];

  return {
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    currentPage: taskSearchState.currentPage,
    currentContact: taskSearchState.currentContact,
    form: taskSearchState.form,
    searchResult: taskSearchState.searchResult,
    detailsExpanded: taskSearchState.detailsExpanded,
    counselorsHash: counselors.hash,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    handleSearchFormChange: bindActionCreators(handleSearchFormChange(taskId), dispatch),
    changeSearchPage: bindActionCreators(changeSearchPage(taskId), dispatch),
    viewContactDetails: bindActionCreators(viewContactDetails(taskId), dispatch),
    handleExpandDetailsSection: bindActionCreators(handleExpandDetailsSection(taskId), dispatch),
    searchContacts: searchContacts(dispatch)(taskId),
  };
};

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(Search));
