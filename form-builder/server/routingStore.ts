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
 * Routing designs (docs/routing-designer.md), one per helpline:
 *
 *   <root>/<code>.json       locally, in form-builder/routing (gitignored)
 *   routing/<code>.json      deployed, in the private drafts bucket (versioned)
 */
import type { S3Client } from '@aws-sdk/client-s3';
import type { StoredRouting } from '../src/routing/model';
import { DesignStore, isValidDesignCode, LocalDesignStore, MemoryDesignStore, S3DesignStore } from './designStore';

export type RoutingStore = DesignStore<StoredRouting>;

export const isValidRoutingCode = isValidDesignCode;

export class LocalRoutingStore extends LocalDesignStore<StoredRouting> {}

export class MemoryRoutingStore extends MemoryDesignStore<StoredRouting> {}

export class S3RoutingStore extends S3DesignStore<StoredRouting> {
  constructor(bucket: string, s3?: Pick<S3Client, 'send'>) {
    super(bucket, 'routing', s3);
  }
}
