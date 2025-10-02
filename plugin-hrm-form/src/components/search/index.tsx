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

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import SearchResults, { CASES_PER_PAGE, CONTACTS_PER_PAGE } from './SearchResults';
import ContactDetails from '../contact/ContactDetails';
import Case from '../case';
import ProfileRouter, { isProfileRoute } from '../profile/ProfileRouter';
import { SearchFormValues, SearchParams } from '../../states/search/types';
import { CustomITask, StandaloneITask } from '../../types/types';
import { newCreateSearchForm, newSearchFormUpdateAction } from '../../states/search/actions';
import { RootState } from '../../states';
import { namespace } from '../../states/storeNamespaces';
import { selectCurrentTopmostRouteForTask } from '../../states/routing/getRoute';
import { changeRoute } from '../../states/routing/actions';
import { SearchResultRoute, SearchRoute, isCaseRoute } from '../../states/routing/types';
import NavigableContainer from '../NavigableContainer';
import selectCasesForSearchResults from '../../states/search/selectCasesForSearchResults';
import selectContactsForSearchResults from '../../states/search/selectContactsForSearchResults';
import { DetailsContext } from '../../states/contacts/contactDetails';
import { SearchForm } from './SearchForm';
import { newSearchCasesAsyncAction, newSearchContactsAsyncAction } from '../../states/search/results';
import asyncDispatch from '../../states/asyncDispatch';

type Props = {
  task: CustomITask | StandaloneITask;
  currentIsCaller?: boolean;
  saveUpdates?: () => Promise<void>;
};

const Search: React.FC<Props> = ({ task, currentIsCaller = false, saveUpdates }) => {
  const [mockedMessage, setMockedMessage] = useState('');
  const [searchParams, setSearchParams] = useState<any>({});
  const { taskSid } = task;
  const dispatch = useDispatch();
  const asyncDispatcher = asyncDispatch(dispatch);
  const routing = useSelector((state: RootState) => selectCurrentTopmostRouteForTask(state, taskSid));
  const searchContext = useSelector((state: RootState) => {
    const currentRoute = selectCurrentTopmostRouteForTask(state, taskSid);
    const contextContactId =
      (isCaseRoute(currentRoute) || currentRoute.route === 'search') && currentRoute.contextContactId;
    return contextContactId ? `contact-${contextContactId}` : 'root';
  });
  const form = useSelector(
    ({ [namespace]: { searchContacts } }: RootState) => searchContacts.tasks[taskSid][searchContext].form,
  );
  const searchContactsResults = useSelector((state: RootState) => {
    return selectContactsForSearchResults(state, taskSid, searchContext);
  });
  const searchCasesResults = useSelector((state: RootState) => {
    return selectCasesForSearchResults(state, taskSid, searchContext);
  });

  const handleSearchFormUpdate = (values: SearchFormValues) =>
    dispatch(newSearchFormUpdateAction(taskSid, searchContext, values));
  const changeSearchPage = (
    subroute: SearchResultRoute['subroute'],
    action?: SearchRoute['action'],
    contactId?: string,
  ) =>
    dispatch(
      changeRoute(
        { route: 'search', subroute, action, casesPage: 0, contactsPage: 0, contextContactId: contactId },
        taskSid,
      ),
    );

  useEffect(() => {
    if (!form) {
      dispatch(newCreateSearchForm(taskSid, searchContext));
    }
  }, [dispatch, form, searchContext, taskSid]);

  const closeDialog = () => setMockedMessage('');

  const handleSearchContacts = (newSearchParams: SearchParams, newOffset: number) =>
    asyncDispatcher(
      newSearchContactsAsyncAction(
        taskSid,
        searchContext,
        { ...form, ...newSearchParams },
        CONTACTS_PER_PAGE,
        newOffset,
      ),
    );

  const handleSearchCases = (newSearchParams, newOffset: number) =>
    asyncDispatcher(
      newSearchCasesAsyncAction(taskSid, searchContext, { ...form, ...newSearchParams }, CASES_PER_PAGE, newOffset),
    );

  const setSearchParamsAndHandleSearch = async newSearchParams => {
    if (routing.route === 'search') {
      if (routing.subroute === 'form' && routing.action === 'select-case') {
        changeSearchPage('case-results', 'select-case', routing.contextContactId);
        await Promise.all([handleSearchCases(newSearchParams, 0)]);
        setSearchParams(newSearchParams);
        return;
      }
      changeSearchPage('contact-results', undefined, routing.contextContactId);
      await Promise.all([handleSearchContacts(newSearchParams, 0), handleSearchCases(newSearchParams, 0)]);
      setSearchParams(newSearchParams);
    }
  };

  const setOffsetAndHandleSearchContacts = (newOffset: number) => handleSearchContacts(searchParams, newOffset);

  const setOffsetAndHandleSearchCases = (newOffset: number) => handleSearchCases(searchParams, newOffset);

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

    if (!form) return null;

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
        return (
          <ContactDetails
            context={DetailsContext.CONTACT_SEARCH}
            contactId={routing.id}
            task={task}
            data-testid="ContactDetails"
          />
        );
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
        noOverflow={true}
      >
        <SearchForm
          initialValues={form}
          handleSearchFormUpdate={handleSearchFormUpdate}
          handleSearch={setSearchParamsAndHandleSearch}
          onlyDataContacts={Boolean(searchParams?.onlyDataContacts)}
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

export default Search;
