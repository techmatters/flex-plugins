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
import useTaskRouter from './useTaskRouter';

/**
 * This is the primary hook for interacting with the modal router. Modal routing is
 * handled exclusively through the search params of the URL. This hook provides
 * access to the current modal and its params as well as methods for manipulating
 * the modal stack.
 *
 * @param task
 * @returns
 */
export const useModalRouter = (task: RouterTask) => {
  const { replaceRoute } = useTaskRouter(task);
  const { location } = useRoutingLocation();

  const searchParams = new URLSearchParams(location.search);
  const activeModals = searchParams.get('activeModals')?.split(',') || [];
  const activeModal = activeModals[activeModals.length - 1];
  const encodedModalParams = searchParams.get('modalParams');
  const modalParams = encodedModalParams ? JSON.parse(atob(encodedModalParams)) : undefined;
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

      console.log('>>> openModal', { modal, params, newModalParams, searchParams });

      replaceRoute({ search: searchParams.toString() });
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

    replaceRoute({ search: searchParams.toString() });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateModalParams = useCallback(
    <T>(params: T) => {
      searchParams.set(
        'modalParams',
        btoa(JSON.stringify({ ...modalParams, [activeModal]: { ...activeModalParams[activeModal], ...params } })),
      );
      console.log('>>> updateModalParams', { params, activeModal, activeModalParams, searchParams });
      replaceRoute({ search: searchParams.toString() });
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

export default useModalRouter;
