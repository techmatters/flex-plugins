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
 * Serves the definitions API from the Vite dev server, reading straight from the local
 * repo checkout. In deployed environments the same routes are served by the backend.
 *
 *   GET /api/helplines                     -> HelplineSummary[]
 *   GET /api/definitions/:code/:version    -> DefinitionFiles
 */
import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { DefinitionsApiError, listHelplines, loadDefinitionFiles } from './definitionsApi';

const sendJson = (res: ServerResponse, statusCode: number, body: unknown) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const handleApiRequest =
  (formDefinitionsDir: string, helplinesConfigDir?: string) =>
  async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (pathname === '/api/helplines') {
        sendJson(res, 200, await listHelplines(formDefinitionsDir));
        return;
      }
      const match = pathname.match(/^\/api\/definitions\/([^/]+)\/([^/]+)$/);
      if (match) {
        sendJson(res, 200, await loadDefinitionFiles(formDefinitionsDir, match[1], match[2], helplinesConfigDir));
        return;
      }
      next();
    } catch (err) {
      const statusCode = err instanceof DefinitionsApiError ? err.statusCode : 500;
      sendJson(res, statusCode, { message: (err as Error).message });
    }
  };

// Served by both `npm run dev` and `npm run preview` (the local production build)
export const definitionsDevApi = (formDefinitionsDir: string, helplinesConfigDir?: string): Plugin => ({
  name: 'form-definitions-dev-api',
  configureServer(server) {
    server.middlewares.use(handleApiRequest(formDefinitionsDir, helplinesConfigDir));
  },
  configurePreviewServer(server) {
    server.middlewares.use(handleApiRequest(formDefinitionsDir, helplinesConfigDir));
  },
});
