/**
 * Copyright (C) 2021-2026 Technology Matters
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

import { createStore, compose, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import { ChatReducer } from './chat.reducer';
import { ConfigReducer } from './config.reducer';
import { NotificationReducer } from './notification.reducer';
import { SessionReducer } from './session.reducer';
import { taskReducer } from '../task';

const typeWindow = window as unknown as { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose };

const composeEnhancers = typeWindow.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const reducers = combineReducers({
  chat: ChatReducer,
  config: ConfigReducer,
  notifications: NotificationReducer,
  session: SessionReducer,
  task: taskReducer,
});

export const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));
