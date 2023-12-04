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
import { useHistory } from 'react-router-dom';

import useRoutingLocation from './useRoutingLocation';

export const useRoutingHistory = () => {
  const history = useHistory();
  const {
    location: { pathname },
  } = useRoutingLocation();

  /**
   * Currently we hack into the history object to get access to the push and replace methods.
   * This could also probably be accomplished in a more "flex native" way using the history
   * actions: https://www.twilio.com/docs/flex/developer/ui/custom-views-and-routes#actions-for-navigation-and-routing
   */
  const { push: pushRoute, replace: replaceRoute } = history;

  // Core routing (not modal) should all be hierarchical, so we can just go back to the previous route by removing the last path segment
  const goBack = useCallback(() => {
    const currentPath = pathname;
    const newPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
    pushRoute(newPath);
  }, [pathname, pushRoute]);

  return {
    history,
    goBack,
    pushRoute,
    replaceRoute,
  };
};

export default useRoutingHistory;
