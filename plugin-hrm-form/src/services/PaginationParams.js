import { isNullOrUndefined } from '../utils';

export function getQueryParams({ limit, offset, sortBy = undefined, sortDirection = undefined, helpline = undefined }) {
  const hasLimit = !isNullOrUndefined(limit);
  const hasOffset = !isNullOrUndefined(offset);
  const hasSortBy = !isNullOrUndefined(sortBy);
  const hasSortDirection = !isNullOrUndefined(sortDirection);
  const hasHelpline = !isNullOrUndefined(helpline);

  const appendLimit = hasLimit ? `limit=${limit}` : '';
  const appendOffset = hasOffset ? `offset=${offset}` : '';
  const appendSortBy = hasSortBy ? `sortBy=${sortBy}` : '';
  const appendSortDirection = hasSortDirection ? `sortDirection=${sortDirection}` : '';
  const appendHelpline = hasHelpline ? `helpline=${helpline}` : '';
  return `?${[appendLimit, appendOffset, appendSortBy, appendSortDirection, appendHelpline].filter(e => e).join('&')}`;
}
