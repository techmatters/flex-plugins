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
import { useLocation } from 'react-router-dom';
import { LocationDescriptorObject } from 'history';
import pick from 'lodash/pick';

import { TaskRoute } from '../types';

// Remove the key from the location object, as it changes on every route change
export const standardizeLocation = (location: LocationDescriptorObject): TaskRoute =>
  pick(location, ['pathname', 'search', 'hash']);

export const useRoutingLocation = () => {
  const fullLocation = useLocation();
  const location = standardizeLocation(fullLocation);

  return {
    fullLocation,
    location,
  };
};

export default useRoutingLocation;
