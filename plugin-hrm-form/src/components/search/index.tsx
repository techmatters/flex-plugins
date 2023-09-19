/**
 * Copyright (C) 2021-2023 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

/* eslint-disable react/prop-types */
/* eslint-disable react/no-multi-comp */
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { Template } from '@twilio/flex-ui';
import { endOfDay, formatISO, parseISO, startOfDay } from 'date-fns';

import SearchForm from './SearchForm';
import SearchResults, { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './SearchResults';
import ContactDetails from './ContactDetails';
import Case from '../case';
import { SearchPages, SearchParams } from '../../states/search/types';
import { CustomITask, SearchAPIContact, standaloneTaskSid } from '../../types/types';
import SearchResultsBackButton from './SearchResults/SearchResultsBackButton';
import {
  handleSearchFormChange,
  changeSearchPage,
  viewContactDetails,
  searchContacts,
  searchCases,
} from '../../states/search/actions';
import {
  namespace,
  searchContactsBase,
  configurationBase,
  routingBase,
  RootState,
  contactFormsBase,
} from '../../states';
import { Flex } from '../../styles/HrmStyles';

type OwnProps = {
  task: CustomITask;
  currentIsCaller?: boolean;
  handleSelectSearchResult?: (contact: SearchAPIContact) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = props => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  const closeDialog = () => setMockedMessage('');

  const handleSearchContacts = (newSearchParams: SearchParams, newOffset) => {
    const { dateFrom, dateTo, ...rest } = newSearchParams;
    const searchParamsToSubmit: SearchParams = rest;
    if (dateFrom) {
      searchParamsToSubmit.dateFrom = formatISO(startOfDay(parseISO(dateFrom)));
    }
    if (dateTo) {
      searchParamsToSubmit.dateTo = formatISO(endOfDay(parseISO(dateTo)));
    }
    props.searchContacts(searchParamsToSubmit, props.counselorsHash, CONTACTS_PER_PAGE, newOffset);
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

  const goToResultsOnContacts = async () => {
    await props.searchContacts(searchParams, props.counselorsHash, CONTACTS_PER_PAGE, 0);
    props.changeSearchPage(SearchPages.resultsContacts);
  };

  const goToResultsOnCases = async () => {
    /*
     * This returns you to the first page of results from viewing a case, which is safest for now since the UI state is inconsistent otherwise.
     * We will need a follow on fix to allow returning to the same page of results as the case to work correctly
     */
    await props.searchCases(searchParams, props.counselorsHash, CASES_PER_PAGE, 0);
    props.changeSearchPage(SearchPages.resultsCases);
  };

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
            task={props.task}
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
            task={props.task}
            showActionIcons={props.showActionIcons}
            currentIsCaller={props.currentIsCaller}
            contact={currentContact}
            handleBack={goToResultsOnContacts}
            handleSelectSearchResult={props.handleSelectSearchResult}
            // buttonData={props.checkButtonData('ContactDetails-Section-ChildInformation')}
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
    // TODO: Needs converting to a div and the className={editContactFormOpen ? 'editingContact' : ''} adding, but that messes up the CSS
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

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const searchContactsState = state[namespace][searchContactsBase];
  const taskId = ownProps.task.taskSid;
  const taskSearchState = searchContactsState.tasks[taskId];
  const { counselors } = state[namespace][configurationBase];
  const routing = state[namespace][routingBase].tasks[taskId];
  const isStandaloneSearch = taskId === standaloneTaskSid;
  const editContactFormOpen = state[namespace][contactFormsBase].editingContact;

  return {
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    currentPage: taskSearchState.currentPage,
    currentContact: taskSearchState.currentContact,
    form: taskSearchState.form,
    searchContactsResults: taskSearchState.searchContactsResult,
    searchCasesResults: taskSearchState.searchCasesResult,
    counselorsHash: counselors.hash,
    showActionIcons: !isStandaloneSearch,
    editContactFormOpen,
    routing,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    handleSearchFormChange: bindActionCreators(handleSearchFormChange(taskId), dispatch),
    changeSearchPage: bindActionCreators(changeSearchPage(taskId), dispatch),
    viewContactDetails: bindActionCreators(viewContactDetails(taskId), dispatch),
    searchContacts: searchContacts(dispatch)(taskId),
    searchCases: searchCases(dispatch)(taskId),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
