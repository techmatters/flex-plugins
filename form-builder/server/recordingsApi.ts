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
 *   POST   /api/recordings/:code/uploads                   where to send a new staging file
 *                                                          ({ fileName, size })
 *   POST   /api/recordings/:code/files/:file/uploaded      the browser sent it: note who, refresh the cache
 *   POST   /api/recordings/:code/files/:file/approve       Aselo staff: ({ approved: boolean })
 *   POST   /api/recordings/:code/files/:file/publish       Aselo staff: copy the approved file to production
 *   DELETE /api/recordings/:code/files/:file               remove the staging file (not a published one)
 *
 * Helpline staff upload and remove their helpline's staging files; only Aselo staff approve and
 * publish, and a file has to be approved before it's published. The browser sends files straight
 * to storage (a signed upload link when deployed), since the Lambda can't take large bodies.
 */
import type { Recording, RecordingsList } from '../src/flows/recordings';
import { MAX_RECORDING_BYTES, RECORDING_CONTENT_TYPES, RECORDING_FILE_PATTERN } from '../src/flows/recordings';
import type { ApiResponse, ApiUser } from './api';
import type { RecordingFiles, RecordingLog, RecordingLogStore } from './recordingStores';

export type RecordingStores = { files: RecordingFiles; log: RecordingLogStore };

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
    /^\/api\/recordings\/([a-z0-9]+)(?:\/(uploads|files\/([^/]+)(?:\/(uploaded|approve|publish))?))?$/,
  );
  if (!match) return fail(404, `Unknown API route ${method} ${path}`);
  const [, code, part, fileName, action] = match;
  if (!canOpen(user, code)) return fail(403, `You don't have access to ${code}.`);
  if (fileName && !RECORDING_FILE_PATTERN.test(fileName)) {
    return fail(
      400,
      'Recordings are named after their Studio widget, as MP3 or WAV: play_message_voice_en_welcome.mp3',
    );
  }

  if (method === 'GET' && !part) return ok(await listRecordings(stores, code));

  if (method === 'POST' && part === 'uploads') {
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
