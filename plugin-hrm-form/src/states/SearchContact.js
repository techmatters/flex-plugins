import { HANDLE_SELECT_SEARCH_RESULT } from './ActionTypes';
import secret from '../private/secret';
import hrmBaseUrl from '../HrmBaseUrl';

export const handleSelectSearchResult = (searchResult, taskId) => ({
  type: HANDLE_SELECT_SEARCH_RESULT,
  searchResult,
  taskId,
});

// TODO: implement real backend call
export async function searchContacts(searchParams) {
  try {
    const response = await fetch(`${hrmBaseUrl}/contacts/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
      body: JSON.stringify(searchParams),
    });

    if (!response.ok) {
      throw response.error();
    }

    return await response.json();
  } catch (e) {
    console.log('Error searching contacts: ', e);
    return [];
  }
}

function copyNewValues(originalObject, objectWithNewValues) {
  if (objectWithNewValues === null || typeof objectWithNewValues === 'undefined') {
    return originalObject;
  }

  const isLeaf = originalObject.hasOwnProperty('value');

  if (isLeaf) {
    return {
      ...originalObject,
      value: objectWithNewValues,
      touched: true,
    };
  }

  const keys = Object.keys(originalObject);
  const values = keys.map(key => copyNewValues(originalObject[key], objectWithNewValues[key]));

  const entries = keys.map((key, i) => [key, values[i]]);
  return Object.fromEntries(entries);
}

export function copySearchResultIntoTask(currentTask, searchResult) {
  const searchResultDetails = searchResult.details;
  return copyNewValues(currentTask, searchResultDetails);
}
