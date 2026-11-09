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
import type { StoredRouting } from '@tech-matters/form-builder-shared/routing/model';

import {
  DesignStore,
  isValidDesignCode,
  newLocalDesignStore,
  newMemoryDesignStore,
  newS3DesignStore,
} from './designStore';

export type RoutingStore = DesignStore<StoredRouting>;

export const isValidRoutingCode = isValidDesignCode;

export const newLocalRoutingStore = (rootDir: string): RoutingStore => newLocalDesignStore<StoredRouting>(rootDir);

export const newMemoryRoutingStore = (): RoutingStore => newMemoryDesignStore<StoredRouting>();

export const newS3RoutingStore = (bucket: string, s3?: Pick<S3Client, 'send'>): RoutingStore =>
  newS3DesignStore<StoredRouting>(bucket, 'routing', s3);
