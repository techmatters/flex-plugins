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
 * Where recordings are kept (see docs/flow-designer.md, "Where recordings are stored"):
 *
 *   <code>/staging/<file>       uploaded by helpline or Aselo staff; staging Studio flows play these
 *   <code>/production/<file>    copied from staging when Aselo staff publish; production plays these
 *
 * A flow that shares its template with others (e.g. the English and Spanish post-call surveys)
 * keeps its recordings in a folder of its own, named after the flow, as the files are named the
 * same: <code>/staging/<flow>/<file>. Each such folder is a library ("<code>/<flow>"); the
 * helpline's own folder is the library "<code>".
 *
 * Deployed, in the recordings bucket, served at https://recordings.tl.techmatters.org/<code>/...;
 * locally, in form-builder/recordings (gitignored), served by the dev server.
 *
 * Who uploaded, approved and published each file is kept apart, in the private drafts bucket
 * (recordings/<code>.json): the recordings bucket is public through CloudFront.
 */
import { createHash, randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { RecordingEnvironment, StoredRecording } from '../src/flows/recordings';
import { RECORDING_FILE_PATTERN } from '../src/flows/recordings';

const ENVIRONMENTS: RecordingEnvironment[] = ['staging', 'production'];

export type UploadTarget = { url: string; method: 'PUT'; headers: Record<string, string> };

export type StoredFiles = Record<RecordingEnvironment, Map<string, StoredRecording>>;

export interface RecordingFiles {
  // The folder Studio plays from: the recordings URL variable for that environment
  baseUrl(code: string, environment: RecordingEnvironment): string;
  list(code: string): Promise<StoredFiles>;
  // Where the browser sends a new staging file
  uploadTarget(code: string, fileName: string, contentType: string): Promise<UploadTarget>;
  publish(code: string, fileName: string): Promise<void>;
  remove(code: string, environment: RecordingEnvironment, fileName: string): Promise<void>;
  // Puts a file straight into a folder (copying a helpline's recordings when importing it)
  store(
    code: string,
    environment: RecordingEnvironment,
    fileName: string,
    content: Uint8Array,
    contentType: string,
  ): Promise<void>;
  // So a replaced file is served straight away, not after the cache expires
  refresh(code: string, environment: RecordingEnvironment, fileName: string): Promise<void>;
}

export type RecordingLogEntry = {
  uploadedBy?: string;
  uploadedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  // The staging file that was approved; a new upload has another etag, so it needs approving again
  approvedEtag?: string;
  publishedBy?: string;
  publishedAt?: string;
  // Where it was copied from, when the helpline was imported
  importedFrom?: Partial<Record<RecordingEnvironment, string>>;
};

export type RecordingLog = Record<string, RecordingLogEntry>;

export interface RecordingLogStore {
  get(code: string): Promise<RecordingLog>;
  put(code: string, log: RecordingLog): Promise<void>;
}

// A library: the helpline ("usvc"), or one of its flows' folders ("usvc/post_call_survey_es")
export const RECORDING_LIBRARY_PATTERN = /^[a-z0-9]+(\/[a-z0-9_]+)?$/;

export const isValidRecordingKey = (library: string, fileName: string) =>
  RECORDING_LIBRARY_PATTERN.test(library) && RECORDING_FILE_PATTERN.test(fileName);

const check = (library: string, fileName: string) => {
  if (!isValidRecordingKey(library, fileName)) throw new Error(`Invalid recording ${library}/${fileName}`);
};

// <code>/<environment>/[<folder>/]: where a library's files are, in an environment
const folderOf = (library: string, environment: RecordingEnvironment) => {
  const [code, folder] = library.split('/');
  return folder ? `${code}/${environment}/${folder}` : `${code}/${environment}`;
};

const emptyFiles = (): StoredFiles => ({ staging: new Map(), production: new Map() });

// ---------------------------------------------------------------------------------------------
// Local

export class LocalRecordingFiles implements RecordingFiles {
  constructor(private readonly rootDir: string) {}

  private file(code: string, environment: RecordingEnvironment, fileName: string) {
    check(code, fileName);
    return path.join(this.rootDir, folderOf(code, environment), fileName);
  }

  // Played through the dev server (devApiPlugin.ts)
  baseUrl(code: string, environment: RecordingEnvironment) {
    const [helpline, folder] = code.split('/');
    return `/api/recordings/${helpline}/local/${environment}${folder ? `/${folder}` : ''}`;
  }

  async list(code: string): Promise<StoredFiles> {
    const files = emptyFiles();
    for (const environment of ENVIRONMENTS) {
      const dir = path.join(this.rootDir, folderOf(code, environment));
      const names = await fs.readdir(dir).catch(() => [] as string[]);
      for (const fileName of names.filter((name) => RECORDING_FILE_PATTERN.test(name))) {
        const full = path.join(dir, fileName);
        const [content, stats] = await Promise.all([fs.readFile(full), fs.stat(full)]);
        files[environment].set(fileName, {
          etag: createHash('md5').update(content).digest('hex'),
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          url: `${this.baseUrl(code, environment)}/${fileName}`,
        });
      }
    }
    return files;
  }

  async uploadTarget(code: string, fileName: string, contentType: string): Promise<UploadTarget> {
    check(code, fileName);
    return {
      url: `${this.baseUrl(code, 'staging')}/${fileName}`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
    };
  }

  // Called by the dev server when the browser sends the file
  async write(code: string, fileName: string, content: Buffer) {
    const target = this.file(code, 'staging', fileName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }

  async read(code: string, environment: RecordingEnvironment, fileName: string) {
    return fs.readFile(this.file(code, environment, fileName));
  }

  async publish(code: string, fileName: string) {
    const target = this.file(code, 'production', fileName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(this.file(code, 'staging', fileName), target);
  }

  async remove(code: string, environment: RecordingEnvironment, fileName: string) {
    await fs.rm(this.file(code, environment, fileName), { force: true });
  }

  async store(code: string, environment: RecordingEnvironment, fileName: string, content: Uint8Array) {
    const target = this.file(code, environment, fileName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  }

  async refresh() {
    // Nothing cached locally
  }
}

export class LocalRecordingLogStore implements RecordingLogStore {
  constructor(private readonly rootDir: string) {}

  private file(code: string) {
    if (!RECORDING_LIBRARY_PATTERN.test(code)) throw new Error(`Invalid helpline ${code}`);
    const [helpline, folder] = code.split('/');
    return path.join(this.rootDir, helpline, folder ? `log-${folder}.json` : 'log.json');
  }

  async get(code: string): Promise<RecordingLog> {
    try {
      return JSON.parse(await fs.readFile(this.file(code), 'utf8')) as RecordingLog;
    } catch {
      return {};
    }
  }

  async put(code: string, log: RecordingLog) {
    const file = this.file(code);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(log, null, 2)}\n`);
  }
}

// ---------------------------------------------------------------------------------------------
// In memory, for tests

export class MemoryRecordingFiles implements RecordingFiles {
  readonly files = new Map<string, { content: string; at: string }>();

  readonly refreshed: string[] = [];

  baseUrl(code: string, environment: RecordingEnvironment) {
    return `https://recordings.test/${folderOf(code, environment)}`;
  }

  async list(code: string) {
    const files = emptyFiles();
    this.files.forEach(({ content, at }, key) => {
      const environment = ENVIRONMENTS.find((candidate) => key.startsWith(`${folderOf(code, candidate)}/`));
      const fileName = environment && key.slice(folderOf(code, environment).length + 1);
      if (!environment || !fileName || fileName.includes('/')) return;
      files[environment as RecordingEnvironment].set(fileName, {
        etag: createHash('md5').update(content).digest('hex'),
        size: content.length,
        lastModified: at,
        url: `${this.baseUrl(code, environment as RecordingEnvironment)}/${fileName}`,
      });
    });
    return files;
  }

  async uploadTarget(code: string, fileName: string, contentType: string): Promise<UploadTarget> {
    check(code, fileName);
    return {
      url: `https://upload.test/${folderOf(code, 'staging')}/${fileName}`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
    };
  }

  // What the browser's upload does
  put(code: string, fileName: string, content: string) {
    this.files.set(`${folderOf(code, 'staging')}/${fileName}`, { content, at: new Date().toISOString() });
  }

  async publish(code: string, fileName: string) {
    const staging = this.files.get(`${folderOf(code, 'staging')}/${fileName}`);
    if (!staging) throw new Error('Nothing to publish');
    this.files.set(`${folderOf(code, 'production')}/${fileName}`, { ...staging });
  }

  async remove(code: string, environment: RecordingEnvironment, fileName: string) {
    this.files.delete(`${folderOf(code, environment)}/${fileName}`);
  }

  async store(code: string, environment: RecordingEnvironment, fileName: string, content: Uint8Array) {
    check(code, fileName);
    this.files.set(`${folderOf(code, environment)}/${fileName}`, {
      content: Buffer.from(content).toString(),
      at: new Date().toISOString(),
    });
  }

  async refresh(code: string, environment: RecordingEnvironment, fileName: string) {
    this.refreshed.push(`${folderOf(code, environment)}/${fileName}`);
  }
}

export class MemoryRecordingLogStore implements RecordingLogStore {
  private logs = new Map<string, RecordingLog>();

  async get(code: string) {
    return structuredClone(this.logs.get(code) ?? {});
  }

  async put(code: string, log: RecordingLog) {
    this.logs.set(code, structuredClone(log));
  }
}

// ---------------------------------------------------------------------------------------------
// Deployed

export class S3RecordingFiles implements RecordingFiles {
  constructor(
    private readonly bucket: string,
    // https://recordings.tl.techmatters.org
    private readonly publicUrl: string,
    // The recordings CloudFront distribution, to refresh replaced files
    private readonly distributionId?: string,
    private readonly s3: Pick<S3Client, 'send'> = new S3Client({}),
    private readonly cloudFront: Pick<CloudFrontClient, 'send'> = new CloudFrontClient({}),
    // Makes the browser's upload link (replaced in tests)
    private readonly sign: (command: PutObjectCommand) => Promise<string> = (command) =>
      getSignedUrl(s3 as S3Client, command, { expiresIn: 600 }),
  ) {}

  private key(code: string, environment: RecordingEnvironment, fileName: string) {
    check(code, fileName);
    return `${folderOf(code, environment)}/${fileName}`;
  }

  baseUrl(code: string, environment: RecordingEnvironment) {
    return `${this.publicUrl}/${folderOf(code, environment)}`;
  }

  async list(code: string): Promise<StoredFiles> {
    const files = emptyFiles();
    let token: string | undefined;
    do {
      const page: ListObjectsV2CommandOutput = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: `${code.split('/')[0]}/`, ContinuationToken: token }),
      );
      (page.Contents ?? []).forEach((object) => {
        // Only this library's files: not its sub-folders' (other flows'), nor the helpline's
        const key = object.Key ?? '';
        const environment = ENVIRONMENTS.find((candidate) => key.startsWith(`${folderOf(code, candidate)}/`));
        const fileName = environment ? key.slice(folderOf(code, environment).length + 1) : '';
        if (!environment || !RECORDING_FILE_PATTERN.test(fileName)) {
          return;
        }
        files[environment as RecordingEnvironment].set(fileName, {
          etag: (object.ETag ?? '').replace(/"/g, ''),
          size: object.Size ?? 0,
          lastModified: object.LastModified?.toISOString() ?? '',
          url: `${this.baseUrl(code, environment as RecordingEnvironment)}/${fileName}`,
        });
      });
      token = page.NextContinuationToken;
    } while (token);
    return files;
  }

  async uploadTarget(code: string, fileName: string, contentType: string): Promise<UploadTarget> {
    const url = await this.sign(
      new PutObjectCommand({ Bucket: this.bucket, Key: this.key(code, 'staging', fileName), ContentType: contentType }),
    );
    return { url, method: 'PUT', headers: { 'Content-Type': contentType } };
  }

  async publish(code: string, fileName: string) {
    await this.s3.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${this.key(code, 'staging', fileName)}`,
        Key: this.key(code, 'production', fileName),
      }),
    );
  }

  async remove(code: string, environment: RecordingEnvironment, fileName: string) {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: this.key(code, environment, fileName) }));
  }

  async store(
    code: string,
    environment: RecordingEnvironment,
    fileName: string,
    content: Uint8Array,
    contentType: string,
  ) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(code, environment, fileName),
        Body: content,
        ContentType: contentType,
      }),
    );
  }

  async refresh(code: string, environment: RecordingEnvironment, fileName: string) {
    if (!this.distributionId) return;
    await this.cloudFront.send(
      new CreateInvalidationCommand({
        DistributionId: this.distributionId,
        InvalidationBatch: {
          CallerReference: randomUUID(),
          Paths: { Quantity: 1, Items: [`/${this.key(code, environment, fileName)}`] },
        },
      }),
    );
  }
}

export class S3RecordingLogStore implements RecordingLogStore {
  constructor(
    // The private drafts bucket
    private readonly bucket: string,
    private readonly s3: Pick<S3Client, 'send'> = new S3Client({}),
  ) {}

  private key(code: string) {
    if (!RECORDING_LIBRARY_PATTERN.test(code)) throw new Error(`Invalid helpline ${code}`);
    return `recordings/${code}.json`;
  }

  async get(code: string): Promise<RecordingLog> {
    try {
      const response = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(code) }));
      return JSON.parse(await response.Body!.transformToString()) as RecordingLog;
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return {};
      throw err;
    }
  }

  async put(code: string, log: RecordingLog) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(code),
        Body: JSON.stringify(log),
        ContentType: 'application/json',
      }),
    );
  }
}
