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

import SearchForm from './SearchForm';
import SearchResults, { CASES_PER_PAGE, CONTACTS_PER_PAGE } from './SearchResults';
import ContactDetails from './ContactDetails';
import Case from '../case';
import ProfileRouter, { isProfileRoute } from '../profile/ProfileRouter';
import { SearchParams } from '../../states/search/types';
import { Contact, CustomITask, standaloneTaskSid } from '../../types/types';
import { handleSearchFormChange, searchCases, searchContacts } from '../../states/search/actions';
import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';
import { getCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { changeRoute, newCloseModalAction } from '../../states/routing/actions';
import { SearchResultRoute, SearchRoute } from '../../states/routing/types';
import NavigableContainer from '../NavigableContainer';
import selectCasesForSearchResults from '../../states/search/selectCasesForSearchResults';
import selectContactsForSearchResults from '../../states/search/selectContactsForSearchResults';

type OwnProps = {
  task: CustomITask;
  currentIsCaller?: boolean;
  handleSelectSearchResult?: (contact: Contact) => void;
  contactId?: string;
  saveUpdates?: () => Promise<void>;
};

const mapStateToProps = (state: RootState, { task }: OwnProps) => {
  const {
    [namespace]: { searchContacts, activeContacts, routing },
  } = state;
  const taskId = task.taskSid;
  const taskSearchState = searchContacts.tasks[taskId];
  const isStandaloneSearch = taskId === standaloneTaskSid;
  const currentRoute = getCurrentTopmostRouteForTask(routing, taskId);

  return {
    activeContacts,
    isRequesting: taskSearchState.isRequesting,
    error: taskSearchState.error,
    form: taskSearchState.form,
    searchContactsResults: selectContactsForSearchResults(state, taskId),
    searchCasesResults: selectCasesForSearchResults(state, taskId),
    showActionIcons: !isStandaloneSearch,
    routing: currentRoute,
    searchCase: taskSearchState.searchExistingCaseStatus,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const taskId = ownProps.task.taskSid;

  return {
    handleSearchFormChange: bindActionCreators(handleSearchFormChange(taskId), dispatch),
    changeSearchPage: (subroute: SearchResultRoute['subroute'], action?: SearchRoute['action']) =>
      dispatch(changeRoute({ route: 'search', subroute, action, casesPage: 0, contactsPage: 0 }, taskId)),
    searchContacts: searchContacts(dispatch)(taskId),
    searchCases: searchCases(dispatch)(taskId),
    closeModal: () => dispatch(newCloseModalAction(taskId)),
  };
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const Search: React.FC<Props> = ({
  task,
  currentIsCaller,
  activeContacts,
  searchContacts,
  searchCases,
  handleSearchFormChange,
  handleSelectSearchResult,
  showActionIcons,
  searchContactsResults,
  searchCasesResults,
  form,
  routing,
  changeSearchPage,
  contactId,
  saveUpdates,
}) => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});

  const closeDialog = () => setMockedMessage('');

  const handleSearchContacts = (newSearchParams: SearchParams, newOffset) =>
    searchContacts(newSearchParams, CONTACTS_PER_PAGE, newOffset);

  const handleSearchCases = (newSearchParams, newOffset) => searchCases(newSearchParams, CASES_PER_PAGE, newOffset);

  const setSearchParamsAndHandleSearch = async newSearchParams => {
    if (routing.route === 'search' && routing.action === 'select-case') {
      changeSearchPage('case-results', 'select-case');
      await Promise.all([handleSearchCases(newSearchParams, 0)]);
      setSearchParams(newSearchParams);
      return;
    }

    changeSearchPage('contact-results');
    await Promise.all([handleSearchContacts(newSearchParams, 0), handleSearchCases(newSearchParams, 0)]);
    setSearchParams(newSearchParams);
  };

  const setOffsetAndHandleSearchContacts = newOffset => handleSearchContacts(searchParams, newOffset);

  const setOffsetAndHandleSearchCases = newOffset => handleSearchCases(searchParams, newOffset);

  const toggleNonDataContacts = async () => {
    if (typeof searchParams.onlyDataContacts !== 'undefined') {
      const { onlyDataContacts } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        onlyDataContacts: !onlyDataContacts,
      };

      setSearchParams(updatedSearchParams);
      return handleSearchContacts(updatedSearchParams, 0);
    }
    return undefined;
  };

  const toggleClosedCases = async () => {
    if (typeof searchParams.closedCases !== 'undefined') {
      const { closedCases } = searchParams;
      const updatedSearchParams = {
        ...searchParams,
        closedCases: !closedCases,
      };

      setSearchParams(updatedSearchParams);
      return handleSearchCases(updatedSearchParams, 0);
    }
    return undefined;
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
    if (isProfileRoute(routing)) return <ProfileRouter task={task} />;

    switch (routing.route) {
      case 'search': {
        if (routing.subroute === 'case-results' || routing.subroute === 'contact-results') {
          return (
            <NavigableContainer
              task={task}
              titleCode={
                routing.action === 'select-case' ? 'SearchResultsIndex-SelectCase' : 'SearchContactsAndCases-Title'
              }
            >
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
                contactId={contactId}
                saveUpdates={saveUpdates}
              />
            </NavigableContainer>
          );
        }
        // Fall through to default to render the form
        break;
      }
      case 'case': {
        return <Case task={task} />;
      }
      case 'contact':
        // Find contact in contact search results or connected to one of case search results
        const contact =
          searchContactsResults.contacts.find(c => c.id.toString() === routing.id.toString()) ||
          searchCasesResults.cases.flatMap(c => c.connectedContacts ?? []).find(c => c.id.toString() === routing.id) ||
          activeContacts.existingContacts[routing.id.toString()]?.savedContact;
        if (contact) {
          return (
            <ContactDetails
              currentIsCaller={currentIsCaller}
              task={task}
              showActionIcons={showActionIcons}
              contact={contact}
              handleSelectSearchResult={handleSelectSearchResult}
              // buttonData={props.checkButtonData('ContactDetails-Section-ChildInformation')}
            />
          );
        }
        break;
      default:
        break;
    }
    return (
      <NavigableContainer
        task={task}
        titleCode={
          routing.route === 'search' && routing.action === 'select-case'
            ? 'SearchContactsAndCases-TitleExistingCase'
            : 'SearchContactsAndCases-Title'
        }
      >
        <SearchForm
          task={task}
          values={form}
          handleSearchFormChange={handleSearchFormChange}
          handleSearch={setSearchParamsAndHandleSearch}
        />
      </NavigableContainer>
    );
  };
  renderSearchPages.displayName = 'SearchPage';

  return (
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

export default connect(mapStateToProps, mapDispatchToProps)(Search);
