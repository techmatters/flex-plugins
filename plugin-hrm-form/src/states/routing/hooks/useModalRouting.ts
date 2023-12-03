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

import { useCallback } from 'react';
import omit from 'lodash/omit';

import { RouterTask } from '../../../types/types';
import useRoutingLocation from './useRoutingLocation';
import useRoutingHistory from './useRoutingHistory';

export const useModalRouting = (task: RouterTask) => {
  /**
   *  Modal routing is all handled in the URL search params.
   */
  const { pushRoute } = useRoutingHistory();
  const { location } = useRoutingLocation();

  const getSearchParams = useCallback(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);
  const searchParams = getSearchParams();

  const getActiveModals = useCallback(() => {
    return searchParams.get('activeModals')?.split(',') || [];
  }, [searchParams]);
  const activeModals = getActiveModals();
  const activeModal = activeModals[activeModals.length - 1];

  const getModalParams = useCallback(() => {
    const modalParams = searchParams.get('modalParams');
    return modalParams ? JSON.parse(atob(modalParams)) : undefined;
  }, [searchParams]);
  const modalParams = getModalParams();
  const activeModalParams = modalParams?.[activeModal];

  const openModal = useCallback(
    <T>(modal: string, params: T) => {
      if (!activeModals.includes(modal)) {
        activeModals.push(modal);
      }
      searchParams.set('activeModals', activeModals.join(','));
      const newModalParams = {
        ...modalParams,
        [modal]: params,
      };

      searchParams.set('modalParams', btoa(JSON.stringify(newModalParams)));

      pushRoute({ search: searchParams.toString() });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const closeModal = useCallback(() => {
    activeModals.pop();
    searchParams.set('activeModals', activeModals.join(','));

    const newModalParams = omit(modalParams, [activeModal]);
    searchParams.set('modalParams', btoa(JSON.stringify(newModalParams)));

    if (activeModals.length === 0) {
      searchParams.delete('activeModals');
      searchParams.delete('modalParams');
    }

    pushRoute({ search: searchParams.toString() });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateModalParams = useCallback(
    <T>(params: T) => {
      searchParams.set(
        'modalParams',
        btoa(JSON.stringify({ ...modalParams, [activeModal]: { activeModalParams, ...params } })),
      );
      pushRoute({ search: searchParams.toString() });
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  return {
    activeModal,
    activeModalParams,
    openModal,
    closeModal,
    updateModalParams,
  };
};

export default useModalRouting;
