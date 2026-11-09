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
 * The form builder API (api.ts) for local development, using the local repo checkout:
 * definitions are read from it, drafts are kept in form-builder/drafts (gitignored) and "Apply"
 * writes into it. Deployed, the same API runs in a Lambda instead.
 *
 * `npm run dev` (in form-builder/) starts it next to the web app's dev server, which passes it
 * the requests to /api. Run from server/ (npm's working directory for its scripts), so the repo
 * is two folders up. Each folder can be pointed elsewhere with its environment variable.
 */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import path from 'path';

import { ApiContext, handleApiRequest } from './api';
import { newLocalDraftStore } from './drafts';
import { newLocalApplier, localNotifier, localUser } from './localServices';

const builderDir = path.resolve(process.cwd(), '..');
const repoDir = path.resolve(builderDir, '..');
const port = Number(process.env.FORM_BUILDER_API_PORT ?? 5181);

// Defaults to this repo's form definitions; override to point at another checkout
const formDefinitionsDir =
  process.env.FORM_DEFINITIONS_DIR ?? path.resolve(repoDir, 'lambdas/packages/hrm-form-definitions/form-definitions');
// Each helpline's Flex service configuration, for its language
const helplinesConfigDir = process.env.HELPLINES_CONFIG_DIR ?? path.resolve(repoDir, 'twilio-iac/helplines');
// The webchat app's per-helpline settings and translations
const webchatConfigDir = process.env.WEBCHAT_CONFIG_DIR ?? path.resolve(repoDir, 'aselo-webchat-react-app/configSrc');

const context: ApiContext = {
  formDefinitionsDir,
  helplinesConfigDir,
  webchatConfigDir,
  // Work in progress, kept out of git; deployed, drafts live in a private S3 bucket
  drafts: newLocalDraftStore(process.env.FORM_BUILDER_DRAFTS_DIR ?? path.resolve(builderDir, 'drafts')),
  applier: newLocalApplier(formDefinitionsDir, repoDir, webchatConfigDir, helplinesConfigDir),
  notifier: localNotifier,
};

const sendJson = (res: ServerResponse, statusCode: number, body: unknown) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const readBody = (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let text = '';
    req.on('data', chunk => {
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

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (!pathname.startsWith('/api/')) {
    sendJson(res, 404, { message: 'Not found' });
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
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Form builder API on http://localhost:${port} (definitions: ${formDefinitionsDir})`);
});
