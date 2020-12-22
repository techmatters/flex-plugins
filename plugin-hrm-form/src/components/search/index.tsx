/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { ITask, withTaskContext, Template } from '@twilio/flex-ui';

import { standaloneTaskSid } from '../StandaloneSearch';
import SearchForm from './SearchForm';
import SearchResults, { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './SearchResults';
import ContactDetails from './ContactDetails';
import Case from '../case';
import { SearchPages } from '../../states/search/types';
import { SearchContact } from '../../types/types';
import SearchResultsBackButton from './SearchResults/SearchResultsBackButton';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  searchCases,
  handleExpandDetailsSection,
} from '../../states/search/actions';
import { namespace, searchContactsBase, configurationBase, routingBase } from '../../states';
import { Flex } from '../../styles/HrmStyles';

type OwnProps = {
  task: ITask;
  currentIsCaller?: boolean;
  handleSelectSearchResult?: (contact: SearchContact) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = props => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  const closeDialog = () => setMockedMessage('');
  const handleMockedMessage = () => setMockedMessage('Not implemented yet!');

  const handleSearchContacts = (newSearchParams, newOffset) => {
    props.searchContacts(newSearchParams, props.counselorsHash, CONTACTS_PER_PAGE, newOffset);
  };

  const handleSearchCases = (newSearchParams, newOffset) => {
    props.searchCases(newSearchParams, props.counselorsHash, CASES_PER_PAGE, newOffset);
  };

  const setSearchParamsAndHandleSearch = newSearchParams => {
    handleSearchContacts(newSearchParams, 0);
    handleSearchCases(newSearchParams, 0);
    setSearchParams(newSearchParams);
  };

  const setOffsetAndHandleSearchContacts = newOffset => {
    handleSearchContacts(searchParams, newOffset);
  };

  const setOffsetAndHandleSearchCases = newOffset => {
    handleSearchCases(searchParams, newOffset);
  };

  const toggleNonDataContacts = () => {
    if (typeof searchParams.onlyDataContacts !== 'undefined') {
      const { onlyDataContacts } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        onlyDataContacts: !onlyDataContacts,
      };

      handleSearchContacts(updatedSearchParams, 0);
      setSearchParams(updatedSearchParams);
    }
  };

  const toggleClosedCases = () => {
    if (typeof searchParams.closedCases !== 'undefined') {
      const { closedCases } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        closedCases: !closedCases,
      };

      handleSearchCases(updatedSearchParams, 0);
      setSearchParams(updatedSearchParams);
    }
  };

  const goToForm = () => props.changeSearchPage('form');

  const goToResultsOnContacts = () => props.changeSearchPage(SearchPages.resultsContacts);

  const goToResultsOnCases = () => props.changeSearchPage(SearchPages.resultsCases);

  const renderMockDialog = () => {
    const isOpen = Boolean(mockedMessage);

    return (
      <Dialog onClose={closeDialog} open={isOpen}>
        <DialogContent>{mockedMessage}</DialogContent>
      </Dialog>
    );
  };
  renderMockDialog.displayName = 'MockDialog';

  const renderSearchPages = (currentPage, currentContact, searchContactsResults, searchCasesResults, form, routing) => {
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
            searchContactsResults={searchContactsResults}
            searchCasesResults={searchCasesResults}
            onlyDataContacts={searchParams.onlyDataContacts}
            closedCases={searchParams.closedCases}
            handleSelectSearchResult={props.handleSelectSearchResult}
            handleSearchContacts={setOffsetAndHandleSearchContacts}
            handleSearchCases={setOffsetAndHandleSearchCases}
            toggleNonDataContacts={toggleNonDataContacts}
            toggleClosedCases={toggleClosedCases}
            handleBack={goToForm}
            handleViewDetails={props.viewContactDetails}
          />
        );
      case SearchPages.details:
        return (
          <ContactDetails
            showActionIcons={props.showActionIcons}
            currentIsCaller={props.currentIsCaller}
            contact={currentContact}
            detailsExpanded={props.detailsExpanded}
            handleBack={goToResultsOnContacts}
            handleSelectSearchResult={props.handleSelectSearchResult}
            handleMockedMessage={handleMockedMessage}
            handleExpandDetailsSection={props.handleExpandDetailsSection}
          />
        );
      case SearchPages.case:
        const { subroute } = routing;
        const showBackButton = typeof subroute === 'undefined';

        return (
          <>
            {showBackButton && (
              <Flex marginTop="15px" marginBottom="15px">
                <SearchResultsBackButton
                  text={<Template code="SearchResultsIndex-BackToResults" />}
                  handleBack={goToResultsOnCases}
                />
              </Flex>
            )}
            <Case task={props.task} isCreating={false} handleClose={goToResultsOnCases} />
          </>
        );
      default:
        return null;
    }
  };
  renderSearchPages.displayName = 'SearchPage';

  const { currentPage, currentContact, searchContactsResults, searchCasesResults, form, routing } = props;

  return (
    <>
      {renderMockDialog()}
      {renderSearchPages(currentPage, currentContact, searchContactsResults, searchCasesResults, form, routing)}
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
  const routing = state[namespace][routingBase].tasks[taskId];
  const isStandaloneSearch = taskId === standaloneTaskSid;

  return {
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    currentPage: taskSearchState.currentPage,
    currentContact: taskSearchState.currentContact,
    form: taskSearchState.form,
    searchContactsResults: taskSearchState.searchContactsResult,
    searchCasesResults: taskSearchState.searchCasesResult,
    detailsExpanded: taskSearchState.detailsExpanded,
    counselorsHash: counselors.hash,
    showActionIcons: !isStandaloneSearch,
    routing,
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
    searchCases: searchCases(dispatch)(taskId),
  };
};

export default withTaskContext(connect(mapStateToProps, mapDispatchToProps)(Search));
