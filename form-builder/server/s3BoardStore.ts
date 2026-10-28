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
import type { Board, BoardSummary } from '../src/flows/model';
import { BoardStore, isValidBoardKey, summaryOf } from './boards';

const PREFIX = 'boards/';
const KEY_PATTERN = /^boards\/([a-z0-9_]+)\/([a-z0-9-]+)\.json$/;

export class S3BoardStore implements BoardStore {
  constructor(
    private readonly bucket: string,
    private readonly s3: Pick<S3Client, 'send'> = new S3Client({}),
  ) {}

  private key(code: string, id: string) {
    if (!isValidBoardKey(code, id)) throw new Error(`Invalid board ${code}/${id}`);
    return `${PREFIX}${code}/${id}.json`;
  }

  async get(code: string, id: string): Promise<Board | undefined> {
    try {
      const response = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(code, id) }));
      return JSON.parse(await response.Body!.transformToString()) as Board;
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return undefined;
      throw err;
    }
  }

  async put(board: Board): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(board.code, board.id),
        Body: JSON.stringify(board),
        ContentType: 'application/json',
      }),
    );
  }

  async remove(code: string, id: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.key(code, id) }));
  }

  async list(): Promise<BoardSummary[]> {
    const keys: string[] = [];
    let token: string | undefined;
    do {
      const page: ListObjectsV2CommandOutput = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: PREFIX, ContinuationToken: token }),
      );
      (page.Contents ?? []).forEach((object) => object.Key && keys.push(object.Key));
      token = page.NextContinuationToken;
    } while (token);

    const boards = await Promise.all(
      keys
        .map((key) => key.match(KEY_PATTERN))
        .flatMap((match) => (match && isValidBoardKey(match[1], match[2]) ? [this.get(match[1], match[2])] : [])),
    );
    return boards.filter((board): board is Board => board !== undefined).map(summaryOf);
  }
}
