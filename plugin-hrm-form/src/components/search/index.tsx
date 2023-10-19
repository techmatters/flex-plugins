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

import SearchForm from './SearchForm';
import SearchResults, { CONTACTS_PER_PAGE, CASES_PER_PAGE } from './SearchResults';
import ContactDetails from './ContactDetails';
import Case from '../case';
import { SearchParams } from '../../states/search/types';
import { CustomITask, Contact, standaloneTaskSid } from '../../types/types';
import SearchResultsBackButton from './SearchResults/SearchResultsBackButton';
import { handleSearchFormChange, searchContacts, searchCases } from '../../states/search/actions';
import { RootState } from '../../states';
import { Flex } from '../../styles/HrmStyles';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { changeRoute, newGoBackAction } from '../../states/routing/actions';
import { SearchRoute } from '../../states/routing/types';

type OwnProps = {
  task: CustomITask;
  currentIsCaller?: boolean;
  handleSelectSearchResult?: (contact: Contact) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = ({
  task,
  currentIsCaller,
  searchContacts,
  searchCases,
  handleSearchFormChange,
  handleSelectSearchResult,
  showActionIcons,
  searchContactsResults,
  searchCasesResults,
  form,
  routing,
  goBack,
  changeSearchPage,
}) => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  const closeDialog = () => setMockedMessage('');

  const handleSearchContacts = (newSearchParams: SearchParams, newOffset) =>
    searchContacts(newSearchParams, CONTACTS_PER_PAGE, newOffset);

  const handleSearchCases = (newSearchParams, newOffset) => searchCases(newSearchParams, CASES_PER_PAGE, newOffset);

  const setSearchParamsAndHandleSearch = async newSearchParams => {
    changeSearchPage('contact-results');
    await Promise.all([handleSearchContacts(newSearchParams, 0), handleSearchCases(newSearchParams, 0)]);
    setSearchParams(newSearchParams);
  };

  const setOffsetAndHandleSearchContacts = newOffset => handleSearchContacts(searchParams, newOffset);

  const setOffsetAndHandleSearchCases = newOffset => handleSearchCases(searchParams, newOffset);

  const toggleNonDataContacts = () => {
    if (typeof searchParams.onlyDataContacts !== 'undefined') {
      const { onlyDataContacts } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        onlyDataContacts: !onlyDataContacts,
      };

      handleSearchContacts(updatedSearchParams, 0);
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

  const goBackFromContacts = async () => {
    /*
     * This returns you to the first page of results from viewing a contact, which is safest for now since the UI state is inconsistent otherwise.
     * We will need a follow on fix to allow returning to the same page of results as the case to work correctly
     */
    await searchContacts(searchParams, CONTACTS_PER_PAGE, 0);
    goBack();
  };

  const goBackFromCases = async () => {
    /*
     * This returns you to the first page of results from viewing a case, which is safest for now since the UI state is inconsistent otherwise.
     * We will need a follow on fix to allow returning to the same page of results as the case to work correctly
     */
    await searchCases(searchParams, CASES_PER_PAGE, 0);
    goBack();
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

  const renderSearchPages = () => {
    switch (routing.route) {
      case 'search': {
        if (routing.subroute === 'case-results' || routing.subroute === 'contact-results') {
          return (
            <SearchResults
              task={task}
              currentIsCaller={currentIsCaller}
              searchContactsResults={searchContactsResults}
              searchCasesResults={searchCasesResults}
              onlyDataContacts={searchParams.onlyDataContacts}
              closedCases={searchParams.closedCases}
              handleSearchContacts={setOffsetAndHandleSearchContacts}
              handleSearchCases={setOffsetAndHandleSearchCases}
              toggleNonDataContacts={toggleNonDataContacts}
              toggleClosedCases={toggleClosedCases}
              handleBack={goBack}
            />
          );
        }
        // Fall through to default to render the form
        break;
      }
      case 'case': {
        return (
          <>
            <Flex marginTop="15px" marginBottom="15px">
              <SearchResultsBackButton
                text={<Template code="SearchResultsIndex-BackToResults" />}
                handleBack={goBackFromCases}
              />
            </Flex>
            <Case task={task} isCreating={false} handleClose={goBackFromCases} />
          </>
        );
      }
      case 'contact': {
        // Find contact in contact search results or connected to one of case search results
        const contact =
          searchContactsResults.contacts.find(c => c.id.toString() === routing.id) ??
          searchCasesResults.cases.flatMap(c => c.connectedContacts ?? []).find(c => c.id.toString() === routing.id);
        if (contact) {
          return (
            <ContactDetails
              currentIsCaller={currentIsCaller}
              task={task}
              showActionIcons={showActionIcons}
              contact={contact}
              handleBack={goBackFromContacts}
              handleSelectSearchResult={handleSelectSearchResult}
              // buttonData={props.checkButtonData('ContactDetails-Section-ChildInformation')}
            />
          );
        }
        break;
      }
      default:
        break;
    }
    return (
      <SearchForm
        task={task}
        values={form}
        handleSearchFormChange={handleSearchFormChange}
        handleSearch={setSearchParamsAndHandleSearch}
      />
    );
  };
  renderSearchPages.displayName = 'SearchPage';

  return (
    // TODO: Needs converting to a div and the className={editContactFormOpen ? 'editingContact' : ''} adding, but that messes up the CSS
    <>
      {renderMockDialog()}
      {renderSearchPages()}
    </>
  );
};

Search.displayName = 'Search';
Search.defaultProps = {
  currentIsCaller: false,
  error: null,
};

const mapStateToProps = (
  { [namespace]: { searchContacts, activeContacts, routing } }: RootState,
  { task }: OwnProps,
) => {
  const taskId = task.taskSid;
  const taskSearchState = searchContacts.tasks[taskId];
  const isStandaloneSearch = taskId === standaloneTaskSid;
  const editContactFormOpen = activeContacts.editingContact;
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskId);

  return {
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    currentPage: taskSearchState.currentPage,
    form: taskSearchState.form,
    searchContactsResults: taskSearchState.searchContactsResult,
    searchCasesResults: taskSearchState.searchCasesResult,
    showActionIcons: !isStandaloneSearch,
    editContactFormOpen,
    routing: currentRoute,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    handleSearchFormChange: bindActionCreators(handleSearchFormChange(taskId), dispatch),
    changeSearchPage: (subroute: SearchRoute['subroute']) =>
      dispatch(changeRoute({ route: 'search', subroute }, taskId)),
    searchContacts: searchContacts(dispatch)(taskId),
    searchCases: searchCases(dispatch)(taskId),
    goBack: () => dispatch(newGoBackAction(taskId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
