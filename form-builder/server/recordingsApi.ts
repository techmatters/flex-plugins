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
 * The recordings routes, called from api.ts:
 *
 *   GET    /api/recordings/:code                           the helpline's recordings and their status
 *
 * Each route also works on one of the helpline's flow folders (flows sharing a template keep their
 * recordings apart): /api/recordings/:code/f/:folder/... (see recordingStores.ts).
 *
 *   POST   /api/recordings/:code/uploads                   where to send a new staging file
 *                                                          ({ fileName, size })
 *   POST   /api/recordings/:code/files/:file/uploaded      the browser sent it: note who, refresh the cache
 *   POST   /api/recordings/:code/files/:file/approve       Aselo staff: ({ approved: boolean })
 *   POST   /api/recordings/:code/files/:file/publish       Aselo staff: copy the approved file to production
 *   DELETE /api/recordings/:code/files/:file               remove the staging file (not a published one)
 *   POST   /api/recordings/:code/import                    Aselo staff: copy a live recording into a folder
 *                                                          ({ sourceUrl, fileName, environment })
 *
 * Helpline staff upload and remove their helpline's staging files; only Aselo staff approve and
 * publish, and a file has to be approved before it's published. The browser sends files straight
 * to storage (a signed upload link when deployed), since the Lambda can't take large bodies.
 */
import type { Recording, RecordingsList } from '../src/flows/recordings';
import { MAX_RECORDING_BYTES, RECORDING_CONTENT_TYPES, RECORDING_FILE_PATTERN } from '../src/flows/recordings';
import type { ApiResponse, ApiUser } from './api';
import type { RecordingFiles, RecordingLog, RecordingLogStore } from './recordingStores';

export type RecordingStores = {
  files: RecordingFiles;
  log: RecordingLogStore;
  // Downloads a recording being imported (replaced in tests)
  fetchSource?: (url: string) => Promise<Uint8Array>;
};

// Where a live helpline's recordings can be copied from: its Twilio Serverless assets, or ours
const isImportSource = (url: unknown): url is string => {
  if (typeof url !== 'string') return false;
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === 'https:' && (hostname.endsWith('.twil.io') || hostname.endsWith('.techmatters.org'));
  } catch {
    return false;
  }
};

const fetchRecording = async (url: string): Promise<Uint8Array> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    // No redirects: only the address that was checked is read
    const response = await fetch(url, { signal: controller.signal, redirect: 'error' });
    if (!response.ok) throw new Error(`it answered ${response.status}`);
    return new Uint8Array(await response.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
};

const ok = (body: unknown, status = 200): ApiResponse => ({ status, body });
const fail = (status: number, message: string): ApiResponse => ({ status, body: { message } });

const isStaff = (user: ApiUser) => user.role === 'aselo-staff';
const canOpen = (user: ApiUser, code: string) => user.helplines === 'all' || user.helplines.includes(code);

export const listRecordings = async ({ files, log }: RecordingStores, code: string): Promise<RecordingsList> => {
  const [stored, notes] = await Promise.all([files.list(code), log.get(code)]);
  const fileNames = [...new Set([...stored.staging.keys(), ...stored.production.keys()])].sort();
  return {
    baseUrls: { staging: files.baseUrl(code, 'staging'), production: files.baseUrl(code, 'production') },
    recordings: fileNames.map((fileName): Recording => {
      const staging = stored.staging.get(fileName);
      const production = stored.production.get(fileName);
      const { approvedEtag, approvedBy, approvedAt, ...note } = notes[fileName] ?? {};
      // An approval only holds for the file that was approved
      const approved = staging && approvedEtag === staging.etag;
      return {
        fileName,
        ...(staging ? { staging } : {}),
        ...(production ? { production } : {}),
        ...note,
        ...(approved ? { approvedBy, approvedAt } : {}),
      };
    }),
  };
};

const updateLog = async (log: RecordingLogStore, code: string, change: (log: RecordingLog) => void) => {
  const current = await log.get(code);
  change(current);
  await log.put(code, current);
};

export const handleRecordingRequest = async (
  stores: RecordingStores | undefined,
  method: string,
  path: string,
  body: unknown,
  user: ApiUser,
  now: string,
): Promise<ApiResponse> => {
  if (!stores) return fail(501, "Recordings aren't set up here.");
  const match = path.match(
    /^\/api\/recordings\/([a-z0-9]+)(?:\/f\/([a-z0-9_]+))?(?:\/(uploads|import|files\/([^/]+)(?:\/(uploaded|approve|publish))?))?$/,
  );
  if (!match) return fail(404, `Unknown API route ${method} ${path}`);
  const [, helpline, folder, part, fileName, action] = match;
  if (!canOpen(user, helpline)) return fail(403, `You don't have access to ${helpline}.`);
  // The library: the helpline's folder, or one of its flows' folders
  const code = folder ? `${helpline}/${folder}` : helpline;
  if (fileName && !RECORDING_FILE_PATTERN.test(fileName)) {
    return fail(
      400,
      'Recordings are named after their Studio widget, as MP3 or WAV: play_message_voice_en_welcome.mp3',
    );
  }

  if (method === 'GET' && !part) return ok(await listRecordings(stores, code));

  // Copying a live helpline's recording from where it is now (importing the helpline)
  if (method === 'POST' && part === 'import') {
    if (!isStaff(user)) return fail(403, 'Only Aselo staff import recordings.');
    const {
      sourceUrl,
      fileName: name,
      environment,
    } = (body ?? {}) as { sourceUrl?: string; fileName?: string; environment?: string };
    if (typeof name !== 'string' || !RECORDING_FILE_PATTERN.test(name)) return fail(400, 'Invalid recording name');
    if (environment !== 'staging' && environment !== 'production') return fail(400, 'Invalid environment');
    if (!isImportSource(sourceUrl)) {
      return fail(400, 'Recordings can only be copied from Twilio Serverless (twil.io) or techmatters.org addresses.');
    }
    let content: Uint8Array;
    try {
      content = await (stores.fetchSource ?? fetchRecording)(sourceUrl);
    } catch (err) {
      return fail(502, `Couldn't download ${name}: ${(err as Error).message}`);
    }
    if (content.byteLength > MAX_RECORDING_BYTES) return fail(413, `${name} is too big for a recording.`);
    const extension = name.split('.').pop() as keyof typeof RECORDING_CONTENT_TYPES;
    await stores.files.store(code, environment, name, content, RECORDING_CONTENT_TYPES[extension]);
    await updateLog(stores.log, code, (log) => {
      const entry = { ...log[name], importedFrom: { ...log[name]?.importedFrom, [environment]: sourceUrl } };
      log[name] =
        environment === 'staging'
          ? { ...entry, uploadedBy: user.name, uploadedAt: now }
          : { ...entry, publishedBy: user.name, publishedAt: now };
    });
    await stores.files.refresh(code, environment, name);
    return ok(await listRecordings(stores, code));
  }

  if (method === 'POST' && part === 'uploads') {
    // For now helpline staff listen to recordings but don't upload them
    if (!isStaff(user)) return fail(403, 'Only Aselo staff upload recordings for now.');
    const { fileName: name, size } = (body ?? {}) as { fileName?: string; size?: number };
    if (typeof name !== 'string' || !RECORDING_FILE_PATTERN.test(name)) {
      return fail(
        400,
        'Recordings are named after their Studio widget, as MP3 or WAV: play_message_voice_en_welcome.mp3',
      );
    }
    const extension = name.split('.').pop() as keyof typeof RECORDING_CONTENT_TYPES;
    if (typeof size === 'number' && size > MAX_RECORDING_BYTES)
      return fail(413, 'That file is too big for a recording.');
    // The type comes from the extension, so Studio and browsers play it right
    return ok(await stores.files.uploadTarget(code, name, RECORDING_CONTENT_TYPES[extension]));
  }

  const list = await listRecordings(stores, code);
  const recording = list.recordings.find((candidate) => candidate.fileName === fileName);

  if (method === 'POST' && action === 'uploaded') {
    if (!isStaff(user)) return fail(403, 'Only Aselo staff upload recordings for now.');
    if (!recording?.staging) return fail(404, "The file didn't arrive. Please upload it again.");
    await updateLog(stores.log, code, (log) => {
      log[fileName] = { ...log[fileName], uploadedBy: user.name, uploadedAt: now };
    });
    await stores.files.refresh(code, 'staging', fileName);
    return ok(await listRecordings(stores, code));
  }

  if (method === 'POST' && action === 'approve') {
    if (!isStaff(user)) return fail(403, 'Only Aselo staff approve recordings.');
    if (!recording?.staging) return fail(404, 'There is no recording to approve.');
    const approved = (body as { approved?: unknown } | undefined)?.approved !== false;
    await updateLog(stores.log, code, (log) => {
      const { approvedBy, approvedAt, approvedEtag, ...rest } = log[fileName] ?? {};
      log[fileName] = approved
        ? { ...rest, approvedBy: user.name, approvedAt: now, approvedEtag: recording.staging!.etag }
        : rest;
    });
    return ok(await listRecordings(stores, code));
  }

  if (method === 'POST' && action === 'publish') {
    if (!isStaff(user)) return fail(403, 'Only Aselo staff publish recordings.');
    if (!recording?.staging) return fail(404, 'There is no recording to publish.');
    if (!recording.approvedBy) return fail(409, 'Approve the recording before publishing it.');
    await stores.files.publish(code, fileName);
    await updateLog(stores.log, code, (log) => {
      log[fileName] = { ...log[fileName], publishedBy: user.name, publishedAt: now };
    });
    await stores.files.refresh(code, 'production', fileName);
    return ok(await listRecordings(stores, code));
  }

  if (method === 'DELETE' && part?.startsWith('files/') && !action) {
    if (!isStaff(user)) return fail(403, 'Only Aselo staff remove recordings for now.');
    if (!recording?.staging) return fail(404, 'There is no staging recording to remove.');
    if (recording.production) {
      return fail(409, 'This recording is published. Ask the Aselo team to remove it from production first.');
    }
    await stores.files.remove(code, 'staging', fileName);
    await updateLog(stores.log, code, (log) => {
      delete log[fileName];
    });
    return ok(await listRecordings(stores, code));
  }

  return fail(404, `Unknown API route ${method} ${path}`);
};
