import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import * as t from '../../../states/search/types';
import * as actions from '../../../states/search/actions';
import { ContactDetailsSections } from '../../../components/common/ContactDetails';
import { SearchContact } from '../../../types/types';
import { searchContacts } from '../../../services/ContactService';
import { searchCases } from '../../../services/CaseService';
import { CASES_PER_PAGE, CONTACTS_PER_PAGE } from '../../../components/search/SearchResults';
import { DefinitionVersionId, loadDefinition } from '../../../formDefinitions';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

jest.mock('../../../services/ContactService', () => ({ searchContacts: jest.fn() }));
jest.mock('../../../services/CaseService', () => ({ searchCases: jest.fn() }));
jest.mock('../../../states/search/helpers', () => ({ addDetails: jest.fn((_hash, xs) => xs) }));

const task = { taskSid: 'WT123' };
const taskId = task.taskSid;

describe('test action creators', () => {
  beforeAll(async () => {
    mockGetDefinitionsResponse(
      getDefinitionVersions,
      DefinitionVersionId.v1,
      await loadDefinition(DefinitionVersionId.v1),
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

  test('handleExpandDetailsSection', () => {
    expect(actions.handleExpandDetailsSection(taskId)(ContactDetailsSections.CALLER_INFORMATION)).toStrictEqual({
      type: t.HANDLE_EXPAND_DETAILS_SECTION,
      taskId,
      section: ContactDetailsSections.CALLER_INFORMATION,
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
    const typedContact = contact as SearchContact; // type casting to avoid writing an entire SearchContact

    expect(actions.viewContactDetails(taskId)(typedContact)).toStrictEqual({
      type: t.VIEW_CONTACT_DETAILS,
      taskId,
      contact: typedContact,
    });
  });

  test('searchContacts (succes)', async () => {
    const contact = {
      contactId: 'fake contact',
      overview: {},
      details: { definitionVersion: 'v1' },
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

    await actions.searchContacts(dispatch)(taskId)(null, null, CONTACTS_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_SUCCESS, taskId, searchResult });
  });

  test('searchContacts (failure)', async () => {
    const error = new Error('Testing failure');
    // @ts-ignore
    searchContacts.mockReturnValueOnce(Promise.reject(error));
    const dispatch = jest.fn();

    await actions.searchContacts(dispatch)(taskId)(null, null, CONTACTS_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CONTACTS_FAILURE, taskId, error });
  });

  test('searchCases (succes)', async () => {
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
    searchCases.mockReturnValueOnce(Promise.resolve(searchResult));
    const dispatch = jest.fn();

    await actions.searchCases(dispatch)(taskId)(null, null, CASES_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_SUCCESS, taskId, searchResult });
  });

  test('searchCases (failure)', async () => {
    const error = new Error('Testing failure');
    // @ts-ignore
    searchCases.mockReturnValueOnce(Promise.reject(error));
    const dispatch = jest.fn();

    await actions.searchCases(dispatch)(taskId)(null, null, CASES_PER_PAGE, 0);

    expect(dispatch).toBeCalledTimes(2);
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_REQUEST, taskId });
    expect(dispatch).toBeCalledWith({ type: t.SEARCH_CASES_FAILURE, taskId, error });
  });
});
