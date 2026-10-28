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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import type { RecordingsList } from '../src/flows/recordings';
import { ApiContext, ApiUser, handleApiRequest } from './api';
import { MemoryDraftStore } from './drafts';
import {
  MemoryRecordingFiles,
  MemoryRecordingLogStore,
  S3RecordingFiles,
  S3RecordingLogStore,
} from './recordingStores';

const staff: ApiUser = { name: 'Aselo person', role: 'aselo-staff', helplines: 'all' };
const usnmStaff: ApiUser = { name: 'NAMI person', role: 'helpline-staff', helplines: ['usnm'] };
const FILE = 'play_message_voice_en_welcome.mp3';

let files: MemoryRecordingFiles;
let context: ApiContext;
const call = (user: ApiUser, method: string, path: string, body?: unknown) =>
  handleApiRequest(context, { method, path, body, user });
const list = async () => (await call(staff, 'GET', '/api/recordings/usnm')).body as RecordingsList;

// What the page does: get the upload link, send the file there, then say it's done
const upload = async (user: ApiUser, content: string, fileName = FILE) => {
  const target = await call(user, 'POST', '/api/recordings/usnm/uploads', { fileName, size: content.length });
  expect(target).toMatchObject({ status: 200, body: { method: 'PUT', headers: { 'Content-Type': 'audio/mpeg' } } });
  files.put('usnm', fileName, content);
  return call(user, 'POST', `/api/recordings/usnm/files/${fileName}/uploaded`);
};

beforeEach(() => {
  files = new MemoryRecordingFiles();
  context = {
    formDefinitionsDir: '/nowhere',
    drafts: new MemoryDraftStore(),
    recordings: { files, log: new MemoryRecordingLogStore() },
    notifier: { draftSubmitted: vi.fn(async () => {}) },
    now: () => new Date('2026-10-28T12:00:00Z'),
  };
});

describe('recordings', () => {
  test('uploaded to staging, approved, then published to production', async () => {
    expect((await upload(usnmStaff, 'first take')).status).toBe(200);
    let [recording] = (await list()).recordings;
    expect(recording).toMatchObject({
      fileName: FILE,
      uploadedBy: 'NAMI person',
      uploadedAt: '2026-10-28T12:00:00.000Z',
    });
    expect(recording.staging?.url).toBe(`https://recordings.test/usnm/staging/${FILE}`);
    expect(recording.production).toBeUndefined();
    expect(files.refreshed).toEqual([`usnm/staging/${FILE}`]);

    // Not before it's approved
    expect((await call(staff, 'POST', `/api/recordings/usnm/files/${FILE}/publish`)).status).toBe(409);
    expect((await call(staff, 'POST', `/api/recordings/usnm/files/${FILE}/approve`, { approved: true })).status).toBe(
      200,
    );
    expect((await call(staff, 'POST', `/api/recordings/usnm/files/${FILE}/publish`)).status).toBe(200);
    [recording] = (await list()).recordings;
    expect(recording).toMatchObject({ approvedBy: 'Aselo person', publishedBy: 'Aselo person' });
    expect(recording.production?.etag).toBe(recording.staging?.etag);
    expect(files.refreshed).toContain(`usnm/production/${FILE}`);

    // A new take needs approving again; production keeps the published one meanwhile
    await upload(usnmStaff, 'second take');
    [recording] = (await list()).recordings;
    expect(recording.approvedBy).toBeUndefined();
    expect(recording.production?.etag).not.toBe(recording.staging?.etag);
  });

  test('only Aselo staff approve and publish; helpline staff only reach their own helpline', async () => {
    await upload(usnmStaff, 'take');
    expect(
      (await call(usnmStaff, 'POST', `/api/recordings/usnm/files/${FILE}/approve`, { approved: true })).status,
    ).toBe(403);
    expect((await call(usnmStaff, 'POST', `/api/recordings/usnm/files/${FILE}/publish`)).status).toBe(403);
    expect((await call(usnmStaff, 'GET', '/api/recordings/usch')).status).toBe(403);
    expect((await call(usnmStaff, 'POST', '/api/recordings/usch/uploads', { fileName: FILE })).status).toBe(403);
  });

  test('files are named after a widget, as MP3 or WAV', async () => {
    for (const fileName of ['welcome.ogg', '../x.mp3', 'play message.mp3']) {
      expect((await call(staff, 'POST', '/api/recordings/usnm/uploads', { fileName })).status).toBe(400);
    }
    const wav = await call(staff, 'POST', '/api/recordings/usnm/uploads', { fileName: 'play_message_voice_en_x.wav' });
    expect(wav.body).toMatchObject({ headers: { 'Content-Type': 'audio/wav' } });
    expect(
      (await call(staff, 'POST', '/api/recordings/usnm/uploads', { fileName: FILE, size: 50_000_000 })).status,
    ).toBe(413);
  });

  test('staging files can be removed, but not once they are published', async () => {
    await upload(usnmStaff, 'typo', 'play_message_voice_en_welcom.mp3');
    expect(
      (await call(usnmStaff, 'DELETE', '/api/recordings/usnm/files/play_message_voice_en_welcom.mp3')).status,
    ).toBe(200);
    expect((await list()).recordings).toEqual([]);

    await upload(usnmStaff, 'take');
    await call(staff, 'POST', `/api/recordings/usnm/files/${FILE}/approve`, { approved: true });
    await call(staff, 'POST', `/api/recordings/usnm/files/${FILE}/publish`);
    expect((await call(staff, 'DELETE', `/api/recordings/usnm/files/${FILE}`)).status).toBe(409);
  });

  test("answer 501 where recordings aren't set up", async () => {
    context = { ...context, recordings: undefined };
    expect((await call(staff, 'GET', '/api/recordings/usnm')).status).toBe(501);
  });
});

describe('recordings in S3', () => {
  test('are listed by folder, uploaded through a signed link, published by copying, and refreshed in CloudFront', async () => {
    const sent: any[] = [];
    const s3 = {
      send: async (command: any) => {
        sent.push(command);
        if (command instanceof ListObjectsV2Command) {
          return {
            Contents: [
              { Key: `usnm/staging/${FILE}`, ETag: '"abc"', Size: 10, LastModified: new Date('2026-10-28T12:00:00Z') },
              {
                Key: `usnm/production/${FILE}`,
                ETag: '"abc"',
                Size: 10,
                LastModified: new Date('2026-10-28T12:00:00Z'),
              },
              { Key: 'usnm/staging/notes.txt', ETag: '"x"' },
            ],
          };
        }
        return {};
      },
    };
    const cloudFront = { send: vi.fn(async () => ({})) };
    const sign = vi.fn(async () => 'https://signed.example/upload');
    const store = new S3RecordingFiles(
      'tl-aselo-recordings',
      'https://recordings.tl.techmatters.org',
      'E123',
      s3 as any,
      cloudFront as any,
      sign,
    );

    const listed = await store.list('usnm');
    expect([...listed.staging.keys()]).toEqual([FILE]);
    expect(listed.production.get(FILE)).toEqual({
      etag: 'abc',
      size: 10,
      lastModified: '2026-10-28T12:00:00.000Z',
      url: `https://recordings.tl.techmatters.org/usnm/production/${FILE}`,
    });

    expect(await store.uploadTarget('usnm', FILE, 'audio/mpeg')).toEqual({
      url: 'https://signed.example/upload',
      method: 'PUT',
      headers: { 'Content-Type': 'audio/mpeg' },
    });
    const signed = (sign.mock.calls[0] as unknown as [PutObjectCommand])[0];
    expect(signed.input).toMatchObject({
      Bucket: 'tl-aselo-recordings',
      Key: `usnm/staging/${FILE}`,
      ContentType: 'audio/mpeg',
    });

    await store.publish('usnm', FILE);
    expect(sent.find((command) => command instanceof CopyObjectCommand)!.input).toEqual({
      Bucket: 'tl-aselo-recordings',
      CopySource: `tl-aselo-recordings/usnm/staging/${FILE}`,
      Key: `usnm/production/${FILE}`,
    });

    await store.refresh('usnm', 'production', FILE);
    const invalidation = (cloudFront.send.mock.calls[0] as unknown as [CreateInvalidationCommand])[0];
    expect(invalidation.input).toMatchObject({
      DistributionId: 'E123',
      InvalidationBatch: { Paths: { Quantity: 1, Items: [`/usnm/production/${FILE}`] } },
    });

    await store.remove('usnm', 'staging', FILE);
    expect(sent.find((command) => command instanceof DeleteObjectCommand)!.input.Key).toBe(`usnm/staging/${FILE}`);
    await expect(store.uploadTarget('usnm', '../x.mp3', 'audio/mpeg')).rejects.toThrow();
  });

  test('who uploaded, approved and published is kept in the private drafts bucket', async () => {
    const objects = new Map<string, string>();
    const s3 = {
      send: async (command: any) => {
        if (command instanceof PutObjectCommand) objects.set(command.input.Key!, String(command.input.Body));
        if (command instanceof GetObjectCommand) {
          if (!objects.has(command.input.Key!)) throw Object.assign(new Error('missing'), { name: 'NoSuchKey' });
          return { Body: { transformToString: async () => objects.get(command.input.Key!) } };
        }
        return {};
      },
    };
    const log = new S3RecordingLogStore('tl-form-builder-drafts', s3 as any);
    expect(await log.get('usnm')).toEqual({});
    await log.put('usnm', { [FILE]: { uploadedBy: 'Ale' } });
    expect([...objects.keys()]).toEqual(['recordings/usnm.json']);
    expect(await log.get('usnm')).toEqual({ [FILE]: { uploadedBy: 'Ale' } });
  });
});
