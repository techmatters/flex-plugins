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
import { getFromAccountScopedLambda } from './fetchProtectedApi';
import type { ConfigurationState } from '../states/configuration/reducer';

/**
 * Sends a new message to the channel bounded to the provided taskSid. Optionally you can change the "from" value (default is "system").
 */
export const getPrivateTwilioConfiguration = async (): Promise<ConfigurationState['twilioPrivateConfiguration']> =>
  getFromAccountScopedLambda(`configuration/twilioPrivate`);
