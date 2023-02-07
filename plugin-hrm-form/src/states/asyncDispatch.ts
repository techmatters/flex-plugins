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

import { Dispatch } from 'react';
import { AnyAction } from 'redux-promise-middleware-actions/lib/actions';

/**
 * Wraps a regular dispatcher in a try ... catch so that rejections are only routed to the '_REJECTED' action handler.
 * This is rather than also being passed up the stack as an unhandled exception, which is the default behaviour of react-promise-middleware
 * @param innerDispatch - the dispatch function to wrap
 */
const asyncDispatch = <T extends AnyAction>(innerDispatch: Dispatch<T>) => async (action: T) => {
  try {
    await innerDispatch(action);
  } catch (err) {
    console.debug(`Rejected promise being handled by ${action.type}_REJECTED:`, err);
  }
};

export default asyncDispatch;
