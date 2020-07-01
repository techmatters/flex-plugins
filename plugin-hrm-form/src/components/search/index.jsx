import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { withTaskContext } from '@twilio/flex-ui';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import ContactDetails from './ContactDetails';
import { contactType, searchResultType, searchFormType } from '../../types';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  SearchPages,
  handleExpandDetailsSection,
} from '../../states/SearchContact';
import { namespace, searchContactsBase } from '../../states';
import { populateCounselors } from '../../services/ServerlessService';
import { getConfig } from '../../HrmFormPlugin';

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
    currentIsCaller: PropTypes.bool,
    handleSelectSearchResult: PropTypes.func.isRequired,
    handleSearchFormChange: PropTypes.func.isRequired,
    searchContacts: PropTypes.func.isRequired,
    changeSearchPage: PropTypes.func.isRequired,
    viewContactDetails: PropTypes.func.isRequired,
    handleExpandDetailsSection: PropTypes.func.isRequired,
    currentPage: PropTypes.oneOf(Object.keys(SearchPages)).isRequired,
    currentContact: contactType,
    form: searchFormType.isRequired,
    searchResult: PropTypes.arrayOf(searchResultType).isRequired,
    detailsExpanded: PropTypes.objectOf(PropTypes.bool).isRequired,
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
      const counselors = await populateCounselors();
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
    const { hrmBaseUrl } = getConfig();
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

const mapStateToProps = (state, ownProps) => {
  const searchContactsState = state[namespace][searchContactsBase];
  const taskId = ownProps.task.taskSid;
  const taskSearchState = searchContactsState.tasks[taskId];

  return {
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    currentPage: taskSearchState.currentPage,
    currentContact: taskSearchState.currentContact,
    form: taskSearchState.form,
    searchResult: taskSearchState.searchResult,
    detailsExpanded: taskSearchState.detailsExpanded,
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
