import { HANDLE_SELECT_SEARCH_RESULT } from './ActionTypes';

export const handleSelectSearchResult = (searchResult, taskId) => ({
  type: HANDLE_SELECT_SEARCH_RESULT,
  searchResult,
  taskId,
});

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
