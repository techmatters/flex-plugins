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
 * checkout: definitions are read from it, drafts, boards, people lists and recordings are kept in
 * form-builder/drafts, boards, people and recordings (gitignored), and "Apply" writes into it.
 * Deployed, the same API runs in a Lambda instead.
 */
import type { IncomingMessage, ServerResponse } from 'http';
import type { Plugin } from 'vite';
import { ApiContext, handleApiRequest } from './api';
import { LocalDraftStore } from './drafts';
import { LocalBoardStore } from './boards';
import { LocalPeopleStore } from './people';
import { LocalApplier, localNotifier, localUser } from './localServices';
import { LocalRecordingFiles, LocalRecordingLogStore } from './recordingStores';
import type { RecordingEnvironment } from '../src/flows/recordings';
import { RECORDING_CONTENT_TYPES } from '../src/flows/recordings';

type Options = {
  formDefinitionsDir: string;
  helplinesConfigDir?: string;
  webchatConfigDir?: string;
  draftsDir: string;
  boardsDir: string;
  peopleDir: string;
  recordingsDir: string;
  repoRoot: string;
};

const readBytes = (req: IncomingMessage): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

// Deployed, recordings are uploaded to S3 and played from CloudFront; locally, from here:
// PUT and GET /api/recordings/<code>/local/<staging|production>/<file>
const LOCAL_RECORDING_PATH = /^\/api\/recordings\/([a-z0-9]+)\/local\/(staging|production)\/([A-Za-z0-9_]+\.(mp3|wav))$/;

const serveLocalRecording = async (
  files: LocalRecordingFiles,
  req: IncomingMessage,
  res: ServerResponse,
  [, code, environment, fileName, extension]: RegExpMatchArray,
) => {
  if (req.method === 'PUT' && environment === 'staging') {
    await files.write(code, fileName, await readBytes(req));
    res.statusCode = 200;
    res.end();
    return;
  }
  try {
    const content = await files.read(code, environment as RecordingEnvironment, fileName);
    res.statusCode = 200;
    res.setHeader('Content-Type', RECORDING_CONTENT_TYPES[extension as keyof typeof RECORDING_CONTENT_TYPES]);
    res.setHeader('Cache-Control', 'no-store');
    res.end(content);
  } catch {
    sendJson(res, 404, { message: 'No such recording' });
  }
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
  (context: ApiContext, recordingFiles: LocalRecordingFiles) =>
  async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const { pathname } = new URL(req.url ?? '/', 'http://localhost');
    if (!pathname.startsWith('/api/')) {
      next();
      return;
    }
    const localRecording = pathname.match(LOCAL_RECORDING_PATH);
    if (localRecording) {
      await serveLocalRecording(recordingFiles, req, res, localRecording);
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
  boardsDir,
  peopleDir,
  recordingsDir,
  repoRoot,
}: Options): Plugin => {
  const recordingFiles = new LocalRecordingFiles(recordingsDir);
  const context: ApiContext = {
    formDefinitionsDir,
    helplinesConfigDir,
    webchatConfigDir,
    drafts: new LocalDraftStore(draftsDir),
    boards: new LocalBoardStore(boardsDir),
    people: new LocalPeopleStore(peopleDir),
    recordings: { files: recordingFiles, log: new LocalRecordingLogStore(recordingsDir) },
    applier: new LocalApplier(formDefinitionsDir, repoRoot, webchatConfigDir, helplinesConfigDir),
    notifier: localNotifier,
  };
  return {
    name: 'form-builder-dev-api',
    configureServer(server) {
      server.middlewares.use(middleware(context, recordingFiles));
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware(context, recordingFiles));
    },
  };
};
