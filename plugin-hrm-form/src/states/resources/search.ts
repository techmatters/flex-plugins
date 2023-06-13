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

import { createAction, createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { ReferrableResource, searchResources } from '../../services/ResourceService';

export type SearchSettings = Omit<Partial<ReferrableResourceSearchState['parameters']>, 'filterSelections'> & {
  filterSelections?: Partial<ReferrableResourceSearchState['parameters']['filterSelections']>;
};

// Represents a resource whose ID was returned by a search, but which is not in the database
type MissingResource = {
  id: string;
  name: string;
  _status: 'missing';
};

export const isMissingResource = (resource: ReferrableResource | MissingResource): resource is MissingResource =>
  '_status' in resource && resource._status === 'missing';

export type ReferrableResourceResult = ReferrableResource | MissingResource;

export enum ResourceSearchStatus {
  NotSearched,
  ResultPending,
  ResultReceived,
  Error,
}

export type FilterOption<T extends string | number = string> = { value: T; label?: string };

const ageOptions: FilterOption<number>[] = [
  { label: '', value: undefined },
  ...Array.from({ length: 30 }, (_, i) => i).map(age => ({ value: age })),
  { value: 100, label: '30+' },
];

export type ReferrableResourceSearchState = {
  // eslint-disable-next-line prettier/prettier
  filterOptions: {
    feeStructure: FilterOption[];
    howServiceIsOffered: FilterOption[];
    targetPopulations: FilterOption[];
    province: FilterOption[];
    city?: FilterOption[];
    minEligibleAge: FilterOption<number>[];
    maxEligibleAge: FilterOption<number>[];
  };
  parameters: {
    generalSearchTerm: string;
    filterSelections: {
      city?: string;
      province?: string;
      interpretationTranslationServicesAvailable?: true;
      minEligibleAge?: number;
      maxEligibleAge?: number;
      feeStructure?: string[];
      howServiceIsOffered?: string[];
      targetPopulations?: string[];
    };
    pageSize: number;
  };
  currentPage: number;
  suggesters: Record<string, string[]>;
  results: ReferrableResourceResult[];
  status: ResourceSearchStatus;
  error?: Error;
};

const allCities: FilterOption[] = [
  { label: '', value: undefined },
  { label: 'Vancouver', value: 'CA/BC/Vancouver' },
  { label: 'Victoria', value: 'CA/BC/Victoria' },
  { label: 'Kelowna', value: 'CA/BC/Kelowna' },
  { label: 'Abbotsford', value: 'CA/BC/Abbotsford' },
  { label: 'Nanaimo', value: 'CA/BC/Nanaimo' },
  { label: 'White Rock', value: 'CA/BC/White Rock' },
  { label: 'Kamloops', value: 'CA/BC/Kamloops' },
  { label: 'Toronto', value: 'CA/ON/Toronto' },
  { label: 'Ottawa', value: 'CA/ON/Ottawa' },
  { label: 'Mississauga', value: 'CA/ON/Mississauga' },
  { label: 'Hamilton', value: 'CA/ON/Hamilton' },
  { label: 'Brampton', value: 'CA/ON/Brampton' },
  { label: 'London', value: 'CA/ON/London' },
  { label: 'Markham', value: 'CA/ON/Markham' },
  { label: 'Vaughan', value: 'CA/ON/Vaughan' },
];

export const initialState: ReferrableResourceSearchState = {
  filterOptions: {
    feeStructure: [
      { value: 'Free' },
      { value: 'Cost Unknown' },
      { value: 'Membership Fee' },
      { value: 'Cost for Service' },
      { value: 'Sliding Scale' },
      { value: 'One Time Small Fee' },
    ],
    howServiceIsOffered: [{ value: 'In-person Support' }, { value: 'Online Support' }, { value: 'Phone Support' }],
    targetPopulations: [
      { value: 'Open to All' },
      { value: 'Black Community' },
      { value: 'LGTBQ2S+ Community' },
      { value: 'Inuit Community' },
      { value: 'Canadian Newcomer Community' },
    ],
    province: [
      { label: '', value: undefined },
      { label: 'Alberta', value: 'CA/AB' },
      { label: 'British Columbia', value: 'CA/BC' },
      { label: 'Manitoba', value: 'CA/MB' },
      { label: 'New Brunswick', value: 'CA/NB' },
      { label: 'Newfoundland and Labrador', value: 'CA/NL' },
      { label: 'Northwest Territories', value: 'CA/NT' },
      { label: 'Nova Scotia', value: 'CA/NS' },
      { label: 'Nunavut', value: 'CA/NU' },
      { label: 'Ontario', value: 'CA/ON' },
      { label: 'Prince Edward Island', value: 'CA/PE' },
      { label: 'Quebec', value: 'CA/QC' },
      { label: 'Saskatchewan', value: 'CA/SK' },
      { label: 'Yukon', value: 'CA/YT' },
    ],
    city: [],
    minEligibleAge: ageOptions,
    maxEligibleAge: ageOptions,
  },
  parameters: {
    filterSelections: {},
    generalSearchTerm: '',
    pageSize: 5,
  },
  currentPage: 0,
  suggesters: {},
  status: ResourceSearchStatus.NotSearched,
  results: [],
};

const CHANGE_SEARCH_RESULT_PAGE_ACTION = 'resource-action/change-search-result-page';

export const changeResultPageAction = createAction(CHANGE_SEARCH_RESULT_PAGE_ACTION, (page: number) => ({
  page,
}));

const UPDATE_SEARCH_FORM_ACTION = 'resource-action/update-search-form';

export const updateSearchFormAction = createAction(
  UPDATE_SEARCH_FORM_ACTION,
  (parameters: SearchSettings) => parameters,
);

const RESET_SEARCH_FORM_ACTION = 'resource-action/reset-search-form';

export const resetSearchFormAction = createAction(RESET_SEARCH_FORM_ACTION);

const RETURN_TO_SEARCH_FORM_ACTION = 'resource-action/return-to-search-form';

export const returnToSearchFormAction = createAction(RETURN_TO_SEARCH_FORM_ACTION);

const SEARCH_ACTION = 'resource-action/search';

export const searchResourceAsyncAction = createAsyncAction(
  SEARCH_ACTION,
  async (parameters: SearchSettings, page: number) => {
    const { pageSize, generalSearchTerm, filterSelections } = parameters;
    const start = page * pageSize;
    return {
      ...(await searchResources({ generalSearchTerm, filters: filterSelections ?? {} }, start, pageSize)),
      start,
    };
  },
  ({ pageSize }: SearchSettings, page: number, newSearch: boolean = true) => ({ newSearch, start: page * pageSize }),
  // { promiseTypeDelimiter: '/' }, // Doesn't work :-(
);

/*
 * To prevent insane arrays being allocated if totalCount is huge.
 * We can always do something fancier if we every actually care about the beyond the 10000th search result
 * (most users don't care about much beyond the 10th search result)
 */
const HARD_SEARCH_RESULT_LIMIT = 10000;

const getFilterOptionsBasedOnSelections = (
  filterSelections: ReferrableResourceSearchState['parameters']['filterSelections'],
): ReferrableResourceSearchState['filterOptions'] => {
  return {
    ...initialState.filterOptions,
    minEligibleAge: ageOptions.filter(opt => {
      const maxSelection = filterSelections.maxEligibleAge ?? 1000;
      return opt.value === undefined || opt.value <= maxSelection;
    }),
    maxEligibleAge: ageOptions.filter(opt => {
      const minSelection = filterSelections.minEligibleAge ?? 0;
      return opt.value === undefined || opt.value >= minSelection;
    }),
    city: allCities.filter(({ value }) =>
      filterSelections.province ? !value || value.startsWith(filterSelections.province) : false,
    ),
  };
};

const ensureFilterSelectionsAreValid = (
  filterSelections: ReferrableResourceSearchState['parameters']['filterSelections'],
  filterOptions: ReferrableResourceSearchState['filterOptions'],
): ReferrableResourceSearchState['parameters']['filterSelections'] => {
  return {
    ...filterSelections,
    // Don't add undefined values to the filter selections
    ...Object.fromEntries(
      Object.entries({
        minEligibleAge: filterOptions.minEligibleAge.find(opt => opt.value === filterSelections.minEligibleAge)?.value,
        maxEligibleAge: filterOptions.maxEligibleAge.find(opt => opt.value === filterSelections.maxEligibleAge)?.value,
        province: filterOptions.province.find(opt => opt.value === filterSelections.province)?.value,
        city: filterOptions.city.find(opt => opt.value === filterSelections.city)?.value,
      }).filter(([, value]) => value !== undefined),
    ),
  };
};

export const resourceSearchReducer = createReducer(initialState, handleAction => [
  /*
   * Cast is a workaround for https://github.com/omichelsen/redux-promise-middleware-actions/issues/13
   * TODO: create a generalised type to put meta property back into all 3 actions for any async action set
   */
  handleAction(searchResourceAsyncAction.pending as typeof searchResourceAsyncAction, (state, action) => {
    return {
      ...state,
      results: action.meta.newSearch ? [] : state.results,
      status: ResourceSearchStatus.ResultPending,
    };
  }),
  handleAction(searchResourceAsyncAction.fulfilled, (state, { payload }) => {
    // If total number of results changes for any reason, assume result set is stale & clear it out
    const boundedResultCount = Math.min(payload.totalCount, HARD_SEARCH_RESULT_LIMIT);
    const fullResults =
      boundedResultCount === state.results.length ? state.results : new Array(boundedResultCount).fill(null);
    fullResults.splice(payload.start, payload.results.length, ...payload.results);
    return {
      ...state,
      status: ResourceSearchStatus.ResultReceived,
      results: fullResults,
    };
  }),
  handleAction(searchResourceAsyncAction.rejected, (state, { payload }) => {
    return {
      ...state,
      status: ResourceSearchStatus.Error,
      error: payload,
    };
  }),
  handleAction(updateSearchFormAction, (state, { payload }) => {
    const updatedFilterOptions = getFilterOptionsBasedOnSelections({
      ...state.parameters.filterSelections,
      ...(payload.filterSelections ?? {}),
    });
    const validatedFilterSelections = ensureFilterSelectionsAreValid(
      { ...state.parameters.filterSelections, ...payload.filterSelections },
      updatedFilterOptions,
    );
    return {
      ...state,
      filterOptions: updatedFilterOptions,
      parameters: {
        ...state.parameters,
        ...payload,
        filterSelections: validatedFilterSelections,
      },
    };
  }),
  handleAction(resetSearchFormAction, state => {
    return {
      ...state,
      parameters: initialState.parameters,
    };
  }),
  handleAction(changeResultPageAction, (state, { payload: { page } }) => {
    return {
      ...state,
      currentPage: page,
    };
  }),
  handleAction(returnToSearchFormAction, state => {
    return {
      ...state,
      status: ResourceSearchStatus.NotSearched,
      currentPage: 0,
    };
  }),
]);

export const getCurrentPageResults = ({
  results,
  currentPage,
  parameters: { pageSize },
}: ReferrableResourceSearchState) => results.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

export const getPageCount = ({ results, parameters: { pageSize } }: ReferrableResourceSearchState) =>
  Math.ceil(results.length / pageSize);
