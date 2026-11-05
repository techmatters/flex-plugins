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
import { type ApiContext, type ApiUser, handleApiRequest } from '@tech-matters/form-builder-server/api';

import { clientFor, DraftClient } from '../drafts/draftClient';

export const inProcessDraftClient = (context: ApiContext, user: ApiUser): DraftClient =>
  clientFor((method, url, body) => {
    // The query string apart, as the dev server and the Lambda pass it
    const { pathname, searchParams } = new URL(url, 'http://localhost');
    return handleApiRequest(context, {
      method,
      path: pathname,
      query: Object.fromEntries(searchParams),
      body: structuredClone(body),
      user,
    });
  });
