/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { ITask, withTaskContext } from '@twilio/flex-ui';

import SearchForm from './SearchForm';
import SearchResults, { CONTACTS_PER_PAGE } from './SearchResults';
import ContactDetails from './ContactDetails';
import { SearchPages } from '../../states/search/types';
import { SearchContact } from '../../types/types';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  handleExpandDetailsSection,
} from '../../states/search/actions';
import { namespace, searchContactsBase, configurationBase } from '../../states';

type OwnProps = {
  task: ITask;
  currentIsCaller?: boolean;
  handleSelectSearchResult: (contact: SearchContact) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = props => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  const closeDialog = () => setMockedMessage('');
  const handleMockedMessage = () => setMockedMessage('Not implemented yet!');

  const handleSearch = (newSearchParams, newOffset) => {
    props.searchContacts(newSearchParams, props.counselorsHash, CONTACTS_PER_PAGE, newOffset);
  };

  const setSearchParamsAndHandleSearch = newSearchParams => {
    handleSearch(newSearchParams, 0);
    setSearchParams(newSearchParams);
  };

  const setOffsetAndHandleSearch = newOffset => {
    handleSearch(searchParams, newOffset);
  };

  const toggleNonDataContacts = () => {
    if (typeof searchParams.onlyDataContacts !== 'undefined') {
      const { onlyDataContacts } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        onlyDataContacts: !onlyDataContacts,
      };

      handleSearch(updatedSearchParams, 0);
      setSearchParams(updatedSearchParams);
    }
  };

  const goToForm = () => props.changeSearchPage('form');

  const goToResults = () => props.changeSearchPage(SearchPages.resultsContacts);

  const renderMockDialog = () => {
    const isOpen = Boolean(mockedMessage);

    return (
      <Dialog onClose={closeDialog} open={isOpen}>
        <DialogContent>{mockedMessage}</DialogContent>
      </Dialog>
    );
  };
  renderMockDialog.displayName = 'MockDialog';

  const renderSearchPages = (currentPage, currentContact, searchResult, form) => {
    switch (currentPage) {
      case SearchPages.form:
        return (
          <SearchForm
            values={form}
            handleSearchFormChange={props.handleSearchFormChange}
            handleSearch={setSearchParamsAndHandleSearch}
          />
        );
      case SearchPages.resultsContacts:
      case SearchPages.resultsCases:
        return (
          <SearchResults
            task={props.task}
            currentIsCaller={props.currentIsCaller}
            results={searchResult}
            onlyDataContacts={searchParams.onlyDataContacts}
            handleSelectSearchResult={props.handleSelectSearchResult}
            handleSearch={setOffsetAndHandleSearch}
            toggleNonDataContacts={toggleNonDataContacts}
            handleBack={goToForm}
            handleViewDetails={props.viewContactDetails}
          />
        );
      case SearchPages.details:
        return (
          <ContactDetails
            currentIsCaller={props.currentIsCaller}
            contact={currentContact}
            detailsExpanded={props.detailsExpanded}
            handleBack={goToResults}
            handleSelectSearchResult={props.handleSelectSearchResult}
            handleMockedMessage={handleMockedMessage}
            handleExpandDetailsSection={props.handleExpandDetailsSection}
          />
        );
      default:
        return null;
    }
  };
  renderSearchPages.displayName = 'SearchPage';

  const { currentPage, currentContact, searchResult, form } = props;

  return (
    <>
      {renderMockDialog()}
      {renderSearchPages(currentPage, currentContact, searchResult, form)}
    </>
  );
};

Search.displayName = 'Search';
Search.defaultProps = {
  currentIsCaller: false,
  currentContact: null,
  error: null,
};

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
