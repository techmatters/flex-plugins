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
import { createAsyncAction, createReducer } from 'redux-promise-middleware-actions';

import { parseFetchError } from '../parseFetchError';
import { getIdentifierByIdentifier } from '../../services/ProfileService';
import loadIdentifierEntryIntoRedux from './loadIdentifierEntryIntoRedux';
import * as t from './types';

type IdentfierIdentifier = t.Identifier['identifier'];

export const loadIdentifierByIdentifierAsync = createAsyncAction(
  t.LOAD_IDENTIFIER_BY_IDENTIFIER,
  getIdentifierByIdentifier,
  (identifier: IdentfierIdentifier) => ({
    identifier,
  }),
);

const handleLoadIdentifierPendingAction = (state: t.ProfileState, action: any) => {
  // This is a little weird, but we will eventually need to support both identifier and id
  // it also ends up with an orphaned identifier entry in the redux store based on the identifier
  // but will be cleaned up in a future PR
  const { id, identifier } = action.meta;

  const identifierUpdate = {
    loading: true,
    error: undefined,
  };

  return loadIdentifierEntryIntoRedux(state, id || identifier, identifierUpdate);
};

const handleLoadIdentifierRejectedAction = (state: t.ProfileState, action: any) => {
  const { id, identifier } = action.meta;
  const error = parseFetchError(action.payload);

  const identifierUpdate = {
    loading: false,
    error,
  };

  return loadIdentifierEntryIntoRedux(state, id || identifier, identifierUpdate);
};

const handleLoadIdentifierFulfilledAction = (state: t.ProfileState, action: any) => {
  const { id } = action.payload;

  const identifierUpdate = {
    loading: false,
    data: {
      ...t.newIdentifierEntry,
      ...state.identifiers?.[id]?.data,
      ...action.payload,
    },
  };

  return loadIdentifierEntryIntoRedux(state, id, identifierUpdate);
};

export const identifierReducer = (initialState: t.ProfileState) =>
  createReducer(initialState, handleAction => [
    handleAction(loadIdentifierByIdentifierAsync.pending, handleLoadIdentifierPendingAction),
    handleAction(loadIdentifierByIdentifierAsync.rejected, handleLoadIdentifierRejectedAction),
    handleAction(loadIdentifierByIdentifierAsync.fulfilled, handleLoadIdentifierFulfilledAction),
  ]);
