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
 * One JSON design per helpline (routing designs, chatbot designs):
 *
 *   <root>/<code>.json         locally, in a gitignored folder of form-builder
 *   <prefix>/<code>.json       deployed, in the private drafts bucket (versioned)
 */
import { promises as fs } from 'fs';
import path from 'path';

import {
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

export interface DesignStore<T extends { code: string }> {
  get(code: string): Promise<T | undefined>;
  put(design: T): Promise<void>;
  // The helplines that have a design
  list(): Promise<string[]>;
}

export const isValidDesignCode = (code: string) => /^[a-z0-9]+$/.test(code);

const check = (code: string) => {
  if (!isValidDesignCode(code)) throw new Error(`Invalid helpline ${code}`);
};

export const newLocalDesignStore = <T extends { code: string }>(rootDir: string): DesignStore<T> => {
  const file = (code: string) => {
    check(code);
    return path.join(rootDir, `${code}.json`);
  };

  return {
    get: async code => {
      try {
        return JSON.parse(await fs.readFile(file(code), 'utf8')) as T;
      } catch {
        return undefined;
      }
    },

    put: async design => {
      await fs.mkdir(rootDir, { recursive: true });
      await fs.writeFile(
        file(design.code),
        `${JSON.stringify(design, null, 2)}
`,
      );
    },

    list: async () => {
      const files = await fs.readdir(rootDir).catch(() => [] as string[]);
      return files
        .filter(name => name.endsWith('.json'))
        .map(name => name.slice(0, -'.json'.length))
        .filter(isValidDesignCode);
    },
  };
};

export const newMemoryDesignStore = <T extends { code: string }>(): DesignStore<T> => {
  const designs = new Map<string, T>();

  return {
    get: async code => {
      const found = designs.get(code);
      return found ? structuredClone(found) : undefined;
    },

    put: async design => {
      designs.set(design.code, structuredClone(design));
    },

    list: async () => [...designs.keys()],
  };
};

export const newS3DesignStore = <T extends { code: string }>(
  // The private drafts bucket
  bucket: string,
  // The folder in it, e.g. routing
  prefix: string,
  s3: Pick<S3Client, 'send'> = new S3Client({}),
): DesignStore<T> => {
  const key = (code: string) => {
    check(code);
    return `${prefix}/${code}.json`;
  };

  return {
    get: async code => {
      try {
        const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key(code) }));
        return JSON.parse(await response.Body!.transformToString()) as T;
      } catch (err) {
        if ((err as Error).name === 'NoSuchKey') return undefined;
        throw err;
      }
    },

    put: async design => {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key(design.code),
          Body: JSON.stringify(design),
          ContentType: 'application/json',
        }),
      );
    },

    list: async () => {
      const codes: string[] = [];
      const pattern = new RegExp(`^${prefix}/([a-z0-9]+)\.json$`);
      let token: string | undefined;
      do {
        const page: ListObjectsV2CommandOutput = await s3.send(
          new ListObjectsV2Command({ Bucket: bucket, Prefix: `${prefix}/`, ContinuationToken: token }),
        );
        (page.Contents ?? []).forEach(object => {
          const code = object.Key?.match(pattern)?.[1];
          if (code) codes.push(code);
        });
        token = page.NextContinuationToken;
      } while (token);
      return codes;
    },
  };
};
