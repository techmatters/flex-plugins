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
 * Serves the form builder API (api.ts) from the Vite dev server, using the local repo
 * checkout: definitions are read from it, drafts are kept in form-builder/drafts (gitignored)
 * and "Apply" writes into it. Deployed, the same API runs in a Lambda instead.
 */
import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { ApiContext, handleApiRequest } from './api';
import { LocalDraftStore } from './drafts';
import { LocalApplier, localNotifier, localUser } from './localServices';

type Options = {
  formDefinitionsDir: string;
  helplinesConfigDir?: string;
  webchatConfigDir?: string;
  draftsDir: string;
  repoRoot: string;
};

const sendJson = (res: ServerResponse, statusCode: number, body: unknown) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const readBody = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let text = '';
    req.on('data', (chunk) => {
      text += chunk;
    });
    req.on('end', () => {
      try {
        resolve(text ? JSON.parse(text) : undefined);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

const middleware =
  (context: ApiContext) =>
  async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (!pathname.startsWith('/api/')) {
      next();
      return;
    }
    try {
      const body = req.method === 'GET' ? undefined : await readBody(req);
      const response = await handleApiRequest(context, {
        method: req.method ?? 'GET',
        path: pathname,
        body,
        user: localUser(),
      });
      sendJson(res, response.status, response.body);
    } catch (err) {
      sendJson(res, 400, { message: (err as Error).message });
    }
  };

// Served by both `npm run dev` and `npm run preview` (the local production build)
export const definitionsDevApi = ({
  formDefinitionsDir,
  helplinesConfigDir,
  webchatConfigDir,
  draftsDir,
  repoRoot,
}: Options): Plugin => {
  const context: ApiContext = {
    formDefinitionsDir,
    helplinesConfigDir,
    webchatConfigDir,
    drafts: new LocalDraftStore(draftsDir),
    applier: new LocalApplier(formDefinitionsDir, repoRoot, webchatConfigDir),
    notifier: localNotifier,
  };
  return {
    name: 'form-builder-dev-api',
    configureServer(server) {
      server.middlewares.use(middleware(context));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(context));
    },
  };
};
