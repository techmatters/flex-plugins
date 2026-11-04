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
 * definitions are read from it; drafts, boards, people lists, recordings, routing and chatbot
 * designs and help questions are kept in form-builder/ (gitignored folders); and "Apply" writes
 * into it. Deployed, the same API runs in a Lambda instead.
 *
 * `npm run dev` (in form-builder/) starts it next to the web app's dev server, which passes it
 * the requests to /api. Run from server/ (npm's working directory for its scripts), so the repo
 * is two folders up. Each folder can be pointed elsewhere with its environment variable.
 */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import path from 'path';
import { ApiContext, handleApiRequest } from './api';
import { LocalDraftStore } from './drafts';
import { LocalApplier, localNotifier, localUser } from './localServices';
import { LocalBoardStore } from './boards';
import { LocalPeopleStore } from './people';
import { LocalRecordingFiles, LocalRecordingLogStore } from './recordingStores';
import { LocalRoutingStore } from './routingStore';
import { LocalChatbotStore } from './chatbotApi';
import { LocalHelpQuestionStore } from './helpQuestions';
import { GitHubBranches } from './branches';
import type { RecordingEnvironment } from '@tech-matters/form-builder-shared/flows/recordings';
import { RECORDING_CONTENT_TYPES } from '@tech-matters/form-builder-shared/flows/recordings';

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

// A folder of form-builder/, unless set (e.g. FORM_BUILDER_BOARDS_DIR)
const localDir = (envName: string, folder: string) => process.env[envName] ?? path.resolve(builderDir, folder);

const recordingFiles = new LocalRecordingFiles(localDir('FORM_BUILDER_RECORDINGS_DIR', 'recordings'));
const context: ApiContext = {
  formDefinitionsDir,
  helplinesConfigDir,
  webchatConfigDir,
  // Work in progress, kept out of git; deployed, drafts live in a private S3 bucket
  drafts: new LocalDraftStore(localDir('FORM_BUILDER_DRAFTS_DIR', 'drafts')),
  // Flow designer boards and its people lists, also kept out of git
  boards: new LocalBoardStore(localDir('FORM_BUILDER_BOARDS_DIR', 'boards')),
  people: new LocalPeopleStore(localDir('FORM_BUILDER_PEOPLE_DIR', 'people')),
  recordings: {
    files: recordingFiles,
    log: new LocalRecordingLogStore(localDir('FORM_BUILDER_RECORDINGS_DIR', 'recordings')),
  },
  routing: new LocalRoutingStore(localDir('FORM_BUILDER_ROUTING_DIR', 'routing')),
  chatbots: new LocalChatbotStore(localDir('FORM_BUILDER_CHATBOTS_DIR', 'chatbots-designs')),
  helpQuestions: new LocalHelpQuestionStore(localDir('FORM_BUILDER_HELP_QUESTIONS_DIR', 'help-questions')),
  // Imports read this checkout, or a branch from GitHub (downloaded into branch-snapshots/)
  branches: new GitHubBranches(path.resolve(builderDir, 'branch-snapshots'), 'This checkout (local files)'),
  applier: new LocalApplier(formDefinitionsDir, repoDir, webchatConfigDir, helplinesConfigDir),
  notifier: localNotifier,
};

const readBytes = (req: IncomingMessage): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });

// Deployed, recordings are uploaded to S3 and played from CloudFront; locally, from here:
// PUT and GET /api/recordings/<code>/local/<staging|production>/[<flow folder>/]<file>
const LOCAL_RECORDING_PATH =
  /^\/api\/recordings\/([a-z0-9]+)\/local\/(staging|production)\/(?:([a-z0-9_]+)\/)?([A-Za-z0-9_]+\.(mp3|wav))$/;

const serveLocalRecording = async (
  req: IncomingMessage,
  res: ServerResponse,
  [, helpline, environment, folder, fileName, extension]: RegExpMatchArray,
) => {
  const code = folder ? `${helpline}/${folder}` : helpline;
  if (req.method === 'PUT' && environment === 'staging') {
    await recordingFiles.write(code, fileName, await readBytes(req));
    res.statusCode = 200;
    res.end();
    return;
  }
  try {
    const content = await recordingFiles.read(code, environment as RecordingEnvironment, fileName);
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

const server = createServer(async (req, res) => {
  const { pathname, searchParams } = new URL(req.url ?? '/', 'http://localhost');
  if (!pathname.startsWith('/api/')) {
    sendJson(res, 404, { message: 'Not found' });
    return;
  }
  const localRecording = pathname.match(LOCAL_RECORDING_PATH);
  if (localRecording) {
    await serveLocalRecording(req, res, localRecording);
    return;
  }
  try {
    const body = req.method === 'GET' ? undefined : await readBody(req);
    const response = await handleApiRequest(context, {
      method: req.method ?? 'GET',
      path: pathname,
      query: Object.fromEntries(searchParams),
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
