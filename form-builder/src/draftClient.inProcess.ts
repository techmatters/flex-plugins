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

/**
 * A DraftClient that runs the server's API code in the same process, for tests.
 * Not imported by the app (it pulls in Node-only server code).
 */
import type { ApiContext, ApiUser } from '../server/api';
import { handleApiRequest } from '../server/api';
import { clientFor, DraftClient } from './draftClient';

export const inProcessDraftClient = (context: ApiContext, user: ApiUser): DraftClient =>
  clientFor((method, path, body) =>
    handleApiRequest(context, { method, path, body: structuredClone(body), user }),
  );
