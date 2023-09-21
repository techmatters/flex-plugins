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

import type { FlexState } from '@twilio/flex-ui';
import { combineReducers } from 'redux';

import { reduce as ContactStateReducer } from './contacts/reducer';
import { reduce as SearchFormReducer } from './search/reducer';
import { reduce as ConnectedCaseReducer } from './case/reducer';
import { reduce as CaseListReducer } from './caseList/reducer';
import { reduce as QueuesStatusReducer } from './queuesStatus/reducer';
import { reduce as ConfigurationReducer } from './configuration/reducer';
import { reduce as RoutingReducer } from './routing/reducer';
import { reduce as CSAMReportReducer } from './csam-report/reducer';
import { reduce as DualWriteReducer } from './dualWrite/reducer';
import { reduce as ReferrableResourcesReducer } from './resources';
import { reduce as ConversationsReducer } from './conversations';
import { reduce as ConferencingReducer } from './conferencing';
import { CaseState } from './case/types';

// Register your redux store under a unique namespace
export const namespace = 'plugin-hrm-form';
export const contactFormsBase = 'activeContacts';
export const searchContactsBase = 'searchContacts';
export const caseListBase = 'caseList';
export const connectedCaseBase = 'connectedCase';
export const queuesStatusBase = 'queuesStatusState';
export const configurationBase = 'configuration';
export const conversationsBase = 'conversations';
export const routingBase = 'routing';
export const csamReportBase = 'csam-report';
const dualWriteBase = 'dualWrite';
export const referrableResourcesBase = 'referrableResources';
// eslint-disable-next-line import/no-unused-modules
export const conferencingBase = 'conferencing';

const reducers = {
  [contactFormsBase]: ContactStateReducer,
  [searchContactsBase]: SearchFormReducer,
  [queuesStatusBase]: QueuesStatusReducer,
  [caseListBase]: CaseListReducer,
  [configurationBase]: ConfigurationReducer,
  [routingBase]: RoutingReducer,
  [csamReportBase]: CSAMReportReducer,
  [dualWriteBase]: DualWriteReducer,
  [referrableResourcesBase]: ReferrableResourcesReducer,
  [conversationsBase]: ConversationsReducer,
  [conferencingBase]: ConferencingReducer,
  /*
   * [csamClcReportBase]: CSAMCLCReportReducer,
   * [connectedCaseBase] - this is going to be combined manually, rather than using 'combineReducers', so isn't in this map
   */
};
type HrmState = {
  [P in keyof typeof reducers]: ReturnType<typeof reducers[P]>;
} & { [connectedCaseBase]: CaseState };

export type RootState = FlexState & { [namespace]: HrmState };
const combinedReducers = combineReducers(reducers);

// Combine the reducers
const reducer = (state: HrmState, action): HrmState => {
  return {
    ...combinedReducers(state, action),
    /*
     * ConnectedCaseReducer's signature includes a parameter for global Hrm State as well as the specific CaseState
     * This makes it incompatible with combineReducers, so instead, we add the case state property with an explicit call to ConnectedCaseReducer, where we specify the extra parameter
     */
    [connectedCaseBase]: ConnectedCaseReducer(state, (state ?? {})[connectedCaseBase], action),
  };
};

export default reducer;
