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

import { DefinitionVersionId, loadDefinition, useFetchDefinitions } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import * as t from '../../../states/search/types';
import * as actions from '../../../states/search/actions';
import { SearchAPIContact } from '../../../types/types';
import { searchContacts } from '../../../services/ContactService';
import { searchCases } from '../../../services/CaseService';
import { CASES_PER_PAGE, CONTACTS_PER_PAGE } from '../../../components/search/SearchResults';
import { getDefinitionVersions } from '../../../hrmConfig';

jest.mock('../../../services/ContactService', () => ({ searchContacts: jest.fn() }));
jest.mock('../../../services/CaseService', () => ({ searchCases: jest.fn() }));

// eslint-disable-next-line react-hooks/rules-of-hooks
const { mockFetchImplementation, mockReset, buildBaseURL } = useFetchDefinitions();

const task = { taskSid: 'WT123' };
const taskId = task.taskSid;

beforeEach(() => {
  mockReset();
});

describe('test action creators', () => {
  beforeAll(async () => {
    const formDefinitionsBaseUrl = buildBaseURL(DefinitionVersionId.v1);
    await mockFetchImplementation(formDefinitionsBaseUrl);

    mockGetDefinitionsResponse(
      getDefinitionVersions,
      DefinitionVersionId.v1,
      await loadDefinition(formDefinitionsBaseUrl),
    );
  });
  test('changeSearchPage', () => {
    expect(actions.changeSearchPage(taskId)('details')).toStrictEqual({
      type: t.CHANGE_SEARCH_PAGE,
      taskId,
      page: t.SearchPages.details,
    });
    expect(actions.changeSearchPage(task.taskSid)('form')).toStrictEqual({
      type: t.CHANGE_SEARCH_PAGE,
      taskId,
      page: t.SearchPages.form,
    });
    expect(actions.changeSearchPage(task.taskSid)('results.contacts')).toStrictEqual({
      type: t.CHANGE_SEARCH_PAGE,
      taskId,
      page: t.SearchPages.resultsContacts,
    });
    expect(actions.changeSearchPage(task.taskSid)('results.cases')).toStrictEqual({
      type: t.CHANGE_SEARCH_PAGE,
      taskId,
      page: t.SearchPages.resultsCases,
    });
  });

  test('handleSearchFormChange', () => {
    expect(actions.handleSearchFormChange(taskId)('firstName', 'Some name')).toStrictEqual({
      type: t.HANDLE_SEARCH_FORM_CHANGE,
      taskId,
      name: 'firstName',
      value: 'Some name',
    });
  });

  test('viewContactDetails', () => {
    const contact: unknown = { contactId: 'fake contact', overview: {}, details: {}, counselor: '', tags: [] };
    const typedContact = contact as SearchAPIContact; // type casting to avoid writing an entire SearchContact

    expect(actions.viewContactDetails(taskId)(typedContact)).toStrictEqual({
      type: t.VIEW_CONTACT_DETAILS,
      taskId,
      contact: typedContact,
    });
  });

  test('searchContacts (success)', async () => {
    const contact = {
      id: 'fake contact',
      rawJson: { definitionVersion: 'v1' },
      counselor: '',
      tags: [],
    };

    const searchResult = {
      count: 1,
      contacts: [contact],
    };
    // @ts-ignore
    searchContacts.mockReturnValueOnce(Promise.resolve(searchResult));
    const dispatch = jest.fn();

    await actions.searchContacts(dispatch)(taskId)(null, CONTACTS_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_SUCCESS, taskId, searchResult });
  });

  test('searchContacts (failure)', async () => {
    const error = new Error('Testing failure');
    // @ts-ignore
    searchContacts.mockReturnValueOnce(Promise.reject(error));
    const dispatch = jest.fn();

    await actions.searchContacts(dispatch)(taskId)(null, CONTACTS_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_FAILURE, taskId, error });
  });

  test('searchCases (success)', async () => {
    const caseObject = {
      createdAt: '2020-11-23T17:38:42.227Z',
      updatedAt: '2020-11-23T17:38:42.227Z',
      helpline: '',
      info: {
        definitionVersion: 'v1',
        households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
      },
    };

    const searchResult = {
      count: 1,
      cases: [caseObject],
    };

    (searchCases as jest.Mock).mockReturnValueOnce(Promise.resolve(searchResult));
    const dispatch = jest.fn();

    await actions.searchCases(dispatch)(taskId)(null, CASES_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_SUCCESS, taskId, searchResult });
  });

  test('searchCases bundles dateFrom and dateTo under filters object if provided', async () => {
    const searchCasesMock = searchCases as jest.Mock;
    const caseObject = {
      createdAt: '2020-11-23T17:38:42.227Z',
      updatedAt: '2020-11-23T17:38:42.227Z',
      helpline: '',
      info: {
        definitionVersion: 'v1',
        households: [{ household: { name: { firstName: 'Maria', lastName: 'Silva' } } }],
      },
    };

    const searchResult = {
      count: 1,
      cases: [caseObject],
    };
    // @ts-ignore

    searchCasesMock.mockClear();
    searchCasesMock.mockReturnValueOnce(Promise.resolve(searchResult));
    const dispatch = jest.fn();

    await actions.searchCases(dispatch)(taskId)(
      { dateFrom: '2020-11-23', dateTo: '2020-11-23', anotherProperty: 'anotherProperty' },
      CASES_PER_PAGE,
      0,
    );

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_SUCCESS, taskId, searchResult });
    expect(searchCases).toBeCalledWith(
      {
        anotherProperty: 'anotherProperty',
        filters: {
          createdAt: {
            from: '2020-11-23T00:00:00Z',
            to: '2020-11-23T23:59:59Z',
          },
        },
      },
      20,
      0,
    );
  });

  test('searchCases (failure)', async () => {
    const error = new Error('Testing failure');
    // @ts-ignore
    searchCases.mockReturnValueOnce(Promise.reject(error));
    const dispatch = jest.fn();

    await actions.searchCases(dispatch)(taskId)(null, CASES_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_FAILURE, taskId, error });
  });
});
