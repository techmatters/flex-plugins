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

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { describe, expect, test } from 'vitest';
import { Draft } from './drafts';
import { S3DraftStore } from './s3DraftStore';

// Just enough of S3 for the store: objects in a map, listed one per page
const fakeS3 = () => {
  const objects = new Map<string, string>();
  const send = async (command: any): Promise<any> => {
    const { Key, Body, Prefix, ContinuationToken } = command.input;
    if (command instanceof PutObjectCommand) objects.set(Key, Body);
    else if (command instanceof DeleteObjectCommand) objects.delete(Key);
    else if (command instanceof GetObjectCommand) {
      if (!objects.has(Key)) throw Object.assign(new Error('missing'), { name: 'NoSuchKey' });
      return { Body: { transformToString: async () => objects.get(Key) } };
    } else if (command instanceof ListObjectsV2Command) {
      const keys = [...objects.keys()].filter((key) => key.startsWith(Prefix)).sort();
      const index = ContinuationToken ? Number(ContinuationToken) : 0;
      return {
        Contents: keys.slice(index, index + 1).map((key) => ({ Key: key })),
        NextContinuationToken: index + 1 < keys.length ? String(index + 1) : undefined,
      };
    }
    return {};
  };
  return { objects, send } as any;
};

const draft = (code: string, files: Record<string, unknown>): Draft => ({
  code,
  version: 'v1',
  files,
  meta: { revision: 1, status: 'editing', updatedAt: 'now', updatedBy: 'someone', baseHashes: {} },
});

describe('drafts in S3', () => {
  test('are saved, listed and removed', async () => {
    const s3 = fakeS3();
    const store = new S3DraftStore('bucket', s3);
    expect(await store.get('usnm', 'v1')).toBeUndefined();

    await store.put(draft('usnm', { 'tabbedForms/CallerInformationTab.json': [] }));
    await store.put(draft('as', { 'service-configuration/common.json': {}, 'CallTypeButtons.json': [] }));
    expect([...s3.objects.keys()].sort()).toEqual(['drafts/as/v1/draft.json', 'drafts/usnm/v1/draft.json']);
    expect(await store.get('usnm', 'v1')).toEqual(draft('usnm', { 'tabbedForms/CallerInformationTab.json': [] }));

    const listed = await store.list();
    expect(listed.map((summary) => [summary.code, summary.changedFiles])).toEqual([
      ['as', ['CallTypeButtons.json', 'service-configuration/common.json']],
      ['usnm', ['tabbedForms/CallerInformationTab.json']],
    ]);

    await store.remove('usnm', 'v1');
    expect(await store.get('usnm', 'v1')).toBeUndefined();
  });

  test('refuse keys and paths outside a draft', async () => {
    const store = new S3DraftStore('bucket', fakeS3());
    await expect(store.get('../x', 'v1')).rejects.toThrow();
    await expect(store.put(draft('usnm', { '../secret.json': {} }))).rejects.toThrow();
  });
});
