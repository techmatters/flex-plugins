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
 * Deployed drafts: one object per draft, drafts/<code>/<version>/draft.json, holding its metadata
 * and changed files, in a private S3 bucket. The bucket is versioned, so earlier saves can be
 * recovered from the AWS console if needed.
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { Draft, DraftStore, DraftSummary, isValidDraftFilePath, isValidDraftKey } from './drafts';

const PREFIX = 'drafts/';
const KEY_PATTERN = /^drafts\/([a-z0-9]+)\/(v\d+)\/draft\.json$/;

type StoredDraft = Pick<Draft, 'meta' | 'files'>;

export const newS3DraftStore = (bucket: string, s3: Pick<S3Client, 'send'> = new S3Client({})): DraftStore => {
  const keyOf = (code: string, version: string) => {
    if (!isValidDraftKey(code, version)) throw new Error(`Invalid draft ${code}/${version}`);
    return `${PREFIX}${code}/${version}/draft.json`;
  };

  const get = async (code: string, version: string): Promise<Draft | undefined> => {
    try {
      const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: keyOf(code, version) }));
      const stored = JSON.parse(await response.Body!.transformToString()) as StoredDraft;
      return { code, version, meta: stored.meta, files: stored.files };
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return undefined;
      throw err;
    }
  };

  const put = async ({ code, version, meta, files }: Draft): Promise<void> => {
    Object.keys(files).forEach(filePath => {
      if (!isValidDraftFilePath(filePath)) throw new Error(`Invalid file path ${filePath}`);
    });
    const stored: StoredDraft = { meta, files };
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: keyOf(code, version),
        Body: JSON.stringify(stored),
        ContentType: 'application/json',
      }),
    );
  };

  const remove = async (code: string, version: string): Promise<void> => {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: keyOf(code, version) }));
  };

  const list = async (): Promise<DraftSummary[]> => {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX, ContinuationToken: token }),
      );
      (page.Contents ?? []).forEach(object => object.Key && keys.push(object.Key));
      token = page.NextContinuationToken;
    } while (token);

    const drafts = await Promise.all(
      keys.map(key => key.match(KEY_PATTERN)).flatMap(match => (match ? [get(match[1], match[2])] : [])),
    );
    return drafts
      .filter((draft): draft is Draft => draft !== undefined)
      .map(({ code, version, meta, files }) => ({ code, version, meta, changedFiles: Object.keys(files).sort() }));
  };

  return { get, put, remove, list };
};
