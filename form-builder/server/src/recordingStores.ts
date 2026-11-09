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
import {
  RECORDING_FILE_PATTERN,
  type RecordingEnvironment,
  type StoredRecording,
} from '@tech-matters/form-builder-shared/flows/recordings';

const ENVIRONMENTS: RecordingEnvironment[] = ['staging', 'production'];

type UploadTarget = { url: string; method: 'PUT'; headers: Record<string, string> };

type StoredFiles = Record<RecordingEnvironment, Map<string, StoredRecording>>;

export interface RecordingFiles {
  // The folder Studio plays from: the recordings URL variable for that environment
  baseUrl(code: string, environment: RecordingEnvironment): string;
  list(code: string): Promise<StoredFiles>;
  // Where the browser sends a new staging file
  uploadTarget(code: string, fileName: string, contentType: string): Promise<UploadTarget>;
  publish(code: string, fileName: string): Promise<void>;
  // A copy under another name (giving a recording its standard name: the widget's), in one environment
  copy(code: string, environment: RecordingEnvironment, from: string, to: string): Promise<void>;
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

type RecordingLogEntry = {
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
  // The file it's a copy of, when it was given its standard name
  renamedFrom?: string;
};

export type RecordingLog = Record<string, RecordingLogEntry>;

export interface RecordingLogStore {
  get(code: string): Promise<RecordingLog>;
  put(code: string, log: RecordingLog): Promise<void>;
}

// A library: the helpline ("usvc"), or one of its flows' folders ("usvc/post_call_survey_es")
const RECORDING_LIBRARY_PATTERN = /^[a-z0-9]+(\/[a-z0-9_]+)?$/;

const isValidRecordingKey = (library: string, fileName: string) =>
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

type LocalRecordingFiles = RecordingFiles & {
  // Called by the dev server when the browser sends the file, and to play it back
  write: (code: string, fileName: string, content: Buffer) => Promise<void>;
  read: (code: string, environment: RecordingEnvironment, fileName: string) => Promise<Buffer>;
};

export const newLocalRecordingFiles = (rootDir: string): LocalRecordingFiles => {
  const file = (code: string, environment: RecordingEnvironment, fileName: string) => {
    check(code, fileName);
    return path.join(rootDir, folderOf(code, environment), fileName);
  };

  // Played through the dev server (devApiPlugin.ts)
  const baseUrl = (code: string, environment: RecordingEnvironment) => {
    const [helpline, folder] = code.split('/');
    return `/api/recordings/${helpline}/local/${environment}${folder ? `/${folder}` : ''}`;
  };

  const list = async (code: string): Promise<StoredFiles> => {
    const files = emptyFiles();
    for (const environment of ENVIRONMENTS) {
      const dir = path.join(rootDir, folderOf(code, environment));
      const names = await fs.readdir(dir).catch(() => [] as string[]);
      for (const fileName of names.filter(name => RECORDING_FILE_PATTERN.test(name))) {
        const full = path.join(dir, fileName);
        const [content, stats] = await Promise.all([fs.readFile(full), fs.stat(full)]);
        files[environment].set(fileName, {
          etag: createHash('md5').update(content).digest('hex'),
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          url: `${baseUrl(code, environment)}/${fileName}`,
        });
      }
    }
    return files;
  };

  const uploadTarget = async (code: string, fileName: string, contentType: string): Promise<UploadTarget> => {
    check(code, fileName);
    return {
      url: `${baseUrl(code, 'staging')}/${fileName}`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
    };
  };

  // Called by the dev server when the browser sends the file
  const write = async (code: string, fileName: string, content: Buffer) => {
    const target = file(code, 'staging', fileName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  };

  const read = async (code: string, environment: RecordingEnvironment, fileName: string) => {
    return fs.readFile(file(code, environment, fileName));
  };

  const publish = async (code: string, fileName: string) => {
    const target = file(code, 'production', fileName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(file(code, 'staging', fileName), target);
  };

  const remove = async (code: string, environment: RecordingEnvironment, fileName: string) => {
    await fs.rm(file(code, environment, fileName), { force: true });
  };

  const copy = async (code: string, environment: RecordingEnvironment, from: string, to: string) => {
    await fs.copyFile(file(code, environment, from), file(code, environment, to));
  };

  const store = async (code: string, environment: RecordingEnvironment, fileName: string, content: Uint8Array) => {
    const target = file(code, environment, fileName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content);
  };

  const refresh = async () => {
    // Nothing cached locally
  };

  return { baseUrl, list, uploadTarget, write, read, publish, remove, copy, store, refresh };
};

export const newLocalRecordingLogStore = (rootDir: string): RecordingLogStore => {
  const fileOf = (code: string) => {
    if (!RECORDING_LIBRARY_PATTERN.test(code)) throw new Error(`Invalid helpline ${code}`);
    const [helpline, folder] = code.split('/');
    return path.join(rootDir, helpline, folder ? `log-${folder}.json` : 'log.json');
  };

  const get = async (code: string): Promise<RecordingLog> => {
    try {
      return JSON.parse(await fs.readFile(fileOf(code), 'utf8')) as RecordingLog;
    } catch {
      return {};
    }
  };

  const put = async (code: string, log: RecordingLog) => {
    const file = fileOf(code);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(log, null, 2)}\n`);
  };

  return { get, put };
};

// ---------------------------------------------------------------------------------------------
// In memory, for tests

export type MemoryRecordingFiles = RecordingFiles & {
  // Every file, by key (<folder>/<fileName>), so tests can check them
  files: Map<string, { content: string; at: string }>;
  // The keys refresh was called for
  refreshed: string[];
  // What the browser's upload does
  put: (code: string, fileName: string, content: string) => void;
};

export const newMemoryRecordingFiles = (): MemoryRecordingFiles => {
  const stored = new Map<string, { content: string; at: string }>();

  const refreshed: string[] = [];

  const baseUrl = (code: string, environment: RecordingEnvironment) => {
    return `https://recordings.test/${folderOf(code, environment)}`;
  };

  const list = async (code: string) => {
    const files = emptyFiles();
    stored.forEach(({ content, at }, key) => {
      const environment = ENVIRONMENTS.find(candidate => key.startsWith(`${folderOf(code, candidate)}/`));
      const fileName = environment && key.slice(folderOf(code, environment).length + 1);
      if (!environment || !fileName || fileName.includes('/')) return;
      files[environment as RecordingEnvironment].set(fileName, {
        etag: createHash('md5').update(content).digest('hex'),
        size: content.length,
        lastModified: at,
        url: `${baseUrl(code, environment as RecordingEnvironment)}/${fileName}`,
      });
    });
    return files;
  };

  const uploadTarget = async (code: string, fileName: string, contentType: string): Promise<UploadTarget> => {
    check(code, fileName);
    return {
      url: `https://upload.test/${folderOf(code, 'staging')}/${fileName}`,
      method: 'PUT',
      headers: { 'Content-Type': contentType },
    };
  };

  // What the browser's upload does
  const put = (code: string, fileName: string, content: string) => {
    stored.set(`${folderOf(code, 'staging')}/${fileName}`, { content, at: new Date().toISOString() });
  };

  const publish = async (code: string, fileName: string) => {
    const staging = stored.get(`${folderOf(code, 'staging')}/${fileName}`);
    if (!staging) throw new Error('Nothing to publish');
    stored.set(`${folderOf(code, 'production')}/${fileName}`, { ...staging });
  };

  const remove = async (code: string, environment: RecordingEnvironment, fileName: string) => {
    stored.delete(`${folderOf(code, environment)}/${fileName}`);
  };

  const copy = async (code: string, environment: RecordingEnvironment, from: string, to: string) => {
    check(code, to);
    const source = stored.get(`${folderOf(code, environment)}/${from}`);
    if (!source) throw new Error(`No ${from} to copy`);
    stored.set(`${folderOf(code, environment)}/${to}`, { ...source });
  };

  const store = async (code: string, environment: RecordingEnvironment, fileName: string, content: Uint8Array) => {
    check(code, fileName);
    stored.set(`${folderOf(code, environment)}/${fileName}`, {
      content: Buffer.from(content).toString(),
      at: new Date().toISOString(),
    });
  };

  const refresh = async (code: string, environment: RecordingEnvironment, fileName: string) => {
    refreshed.push(`${folderOf(code, environment)}/${fileName}`);
  };

  return { files: stored, refreshed, baseUrl, list, uploadTarget, put, publish, remove, copy, store, refresh };
};

export const newMemoryRecordingLogStore = (): RecordingLogStore => {
  const logs = new Map<string, RecordingLog>();

  const get = async (code: string) => {
    return structuredClone(logs.get(code) ?? {});
  };

  const put = async (code: string, log: RecordingLog) => {
    logs.set(code, structuredClone(log));
  };

  return { get, put };
};

// ---------------------------------------------------------------------------------------------
// Deployed

export const newS3RecordingFiles = (
  bucket: string,
  // https://recordings.tl.techmatters.org
  publicUrl: string,
  // The recordings CloudFront distribution, to refresh replaced files
  distributionId?: string,
  s3: Pick<S3Client, 'send'> = new S3Client({}),
  cloudFront: Pick<CloudFrontClient, 'send'> = new CloudFrontClient({}),
  // Makes the browser's upload link (replaced in tests)
  sign: (command: PutObjectCommand) => Promise<string> = command =>
    getSignedUrl(s3 as S3Client, command, { expiresIn: 600 }),
): RecordingFiles => {
  const keyOf = (code: string, environment: RecordingEnvironment, fileName: string) => {
    check(code, fileName);
    return `${folderOf(code, environment)}/${fileName}`;
  };

  const baseUrl = (code: string, environment: RecordingEnvironment) => {
    return `${publicUrl}/${folderOf(code, environment)}`;
  };

  const list = async (code: string): Promise<StoredFiles> => {
    const files = emptyFiles();
    let token: string | undefined;
    do {
      const page: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: `${code.split('/')[0]}/`, ContinuationToken: token }),
      );
      (page.Contents ?? []).forEach(object => {
        // Only this library's files: not its sub-folders' (other flows'), nor the helpline's
        const key = object.Key ?? '';
        const environment = ENVIRONMENTS.find(candidate => key.startsWith(`${folderOf(code, candidate)}/`));
        const fileName = environment ? key.slice(folderOf(code, environment).length + 1) : '';
        if (!environment || !RECORDING_FILE_PATTERN.test(fileName)) {
          return;
        }
        files[environment as RecordingEnvironment].set(fileName, {
          etag: (object.ETag ?? '').replace(/"/g, ''),
          size: object.Size ?? 0,
          lastModified: object.LastModified?.toISOString() ?? '',
          url: `${baseUrl(code, environment as RecordingEnvironment)}/${fileName}`,
        });
      });
      token = page.NextContinuationToken;
    } while (token);
    return files;
  };

  const uploadTarget = async (code: string, fileName: string, contentType: string): Promise<UploadTarget> => {
    const url = await sign(
      new PutObjectCommand({ Bucket: bucket, Key: keyOf(code, 'staging', fileName), ContentType: contentType }),
    );
    return { url, method: 'PUT', headers: { 'Content-Type': contentType } };
  };

  const publish = async (code: string, fileName: string) => {
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${keyOf(code, 'staging', fileName)}`,
        Key: keyOf(code, 'production', fileName),
      }),
    );
  };

  const remove = async (code: string, environment: RecordingEnvironment, fileName: string) => {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: keyOf(code, environment, fileName) }));
  };

  const copy = async (code: string, environment: RecordingEnvironment, from: string, to: string) => {
    await s3.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${keyOf(code, environment, from)}`,
        Key: keyOf(code, environment, to),
      }),
    );
  };

  const store = async (
    code: string,
    environment: RecordingEnvironment,
    fileName: string,
    content: Uint8Array,
    contentType: string,
  ) => {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: keyOf(code, environment, fileName),
        Body: content,
        ContentType: contentType,
      }),
    );
  };

  const refresh = async (code: string, environment: RecordingEnvironment, fileName: string) => {
    if (!distributionId) return;
    await cloudFront.send(
      new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: randomUUID(),
          Paths: { Quantity: 1, Items: [`/${keyOf(code, environment, fileName)}`] },
        },
      }),
    );
  };

  return { baseUrl, list, uploadTarget, publish, remove, copy, store, refresh };
};

export const newS3RecordingLogStore = (
  // The private drafts bucket
  bucket: string,
  s3: Pick<S3Client, 'send'> = new S3Client({}),
): RecordingLogStore => {
  const key = (code: string) => {
    if (!RECORDING_LIBRARY_PATTERN.test(code)) throw new Error(`Invalid helpline ${code}`);
    return `recordings/${code}.json`;
  };

  const get = async (code: string): Promise<RecordingLog> => {
    try {
      const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key(code) }));
      return JSON.parse(await response.Body!.transformToString()) as RecordingLog;
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return {};
      throw err;
    }
  };

  const put = async (code: string, log: RecordingLog) => {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key(code),
        Body: JSON.stringify(log),
        ContentType: 'application/json',
      }),
    );
  };

  return { get, put };
};
