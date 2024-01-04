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
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import asyncDispatch from '../../asyncDispatch';
import * as IdentifierActions from '../identifiers';
import * as ProfileSelectors from '../selectors';
import { RootState } from '../..';
import { Identifier } from '../types';

export type UseIdentifierByIdentifierLoaderParams = {
  identifierIdentifier: Identifier['identifier'];
  shouldAutoload?: Boolean;
};

export type UseIdentifierByIdentifierLoaderReturn = {
  error?: any;
  loading: boolean;
  loadIdentifierByIdentifier: () => void;
};

export type UseIdentifierByIdentifierParams = UseIdentifierByIdentifierLoaderParams;

export type UseIdentifierByIdentifierReturn = UseIdentifierByIdentifierLoaderReturn & {
  identifier?: Identifier;
};

/**
 * Load a identifier by id into redux
 * @param {UseIdentifierByIdentifierLoaderParams} identifierId - The id of the identifier to load
 * @returns {UseIdentifierByIdentifierLoaderReturn} - State and actions for the identifier
 */
export const useIdentifierByIdentifierLoader = ({
  identifierIdentifier,
  shouldAutoload = false,
}: UseIdentifierByIdentifierLoaderParams): UseIdentifierByIdentifierLoaderReturn => {
  const dispatch = useDispatch();
  const error = useSelector(
    (state: RootState) => ProfileSelectors.selectIdentifierByIdentifier(state, identifierIdentifier)?.error,
  );
  const loading = useSelector(
    (state: RootState) => ProfileSelectors.selectIdentifierByIdentifier(state, identifierIdentifier)?.loading,
  );
  const loadIdentifierByIdentifier = useCallback(() => {
    if (!identifierIdentifier) return;
    asyncDispatch(dispatch)(IdentifierActions.loadIdentifierByIdentifierAsync(identifierIdentifier));
  }, [dispatch, identifierIdentifier]);

  useEffect(() => {
    if (shouldAutoload && !loading) {
      loadIdentifierByIdentifier();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifierIdentifier, shouldAutoload, loadIdentifierByIdentifier]);

  return {
    error,
    loading,
    loadIdentifierByIdentifier,
  };
};

/**
 * Load a identifier by id into redux
 * @param {Identifier['id']} identifierId - The id of the identifier to load
 * @returns {UseIdentifierLoaderReturn} - State and actions for the identifier
 */
export const useIdentifierByIdentifier = (params: UseIdentifierByIdentifierParams): UseIdentifierByIdentifierReturn => {
  const { identifierIdentifier } = params;

  const identifier = useSelector(
    (state: RootState) => ProfileSelectors.selectIdentifierByIdentifier(state, identifierIdentifier)?.data,
  );
  return {
    identifier,
    ...useIdentifierByIdentifierLoader(params),
  };
};
