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
 * Deployed boards: boards/<code>/<id>.json in the private, versioned drafts bucket, so earlier
 * saves can be recovered from the AWS console if needed.
 */
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import type { Board, BoardSummary } from '@tech-matters/form-builder-shared/flows/model';

import { BoardStore, isValidBoardKey, summaryOf } from './boards';

const PREFIX = 'boards/';
const KEY_PATTERN = /^boards\/([a-z0-9_]+)\/([a-z0-9-]+)\.json$/;

export const newS3BoardStore = (bucket: string, s3: Pick<S3Client, 'send'> = new S3Client({})): BoardStore => {
  const keyOf = (code: string, id: string) => {
    if (!isValidBoardKey(code, id)) throw new Error(`Invalid board ${code}/${id}`);
    return `${PREFIX}${code}/${id}.json`;
  };

  const get = async (code: string, id: string): Promise<Board | undefined> => {
    try {
      const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: keyOf(code, id) }));
      return JSON.parse(await response.Body!.transformToString()) as Board;
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return undefined;
      throw err;
    }
  };

  const put = async (board: Board): Promise<void> => {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: keyOf(board.code, board.id),
        Body: JSON.stringify(board),
        ContentType: 'application/json',
      }),
    );
  };

  const remove = async (code: string, id: string): Promise<void> => {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: keyOf(code, id) }));
  };

  const list = async (): Promise<BoardSummary[]> => {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX, ContinuationToken: token }),
      );
      (page.Contents ?? []).forEach(object => object.Key && keys.push(object.Key));
      token = page.NextContinuationToken;
    } while (token);

    const boards = await Promise.all(
      keys
        .map(key => key.match(KEY_PATTERN))
        .flatMap(match => (match && isValidBoardKey(match[1], match[2]) ? [get(match[1], match[2])] : [])),
    );
    return boards.filter((board): board is Board => board !== undefined).map(summaryOf);
  };

  return { get, put, remove, list };
};
