/**
 * Copyright (C) 2021-2025 Technology Matters
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

export type ISO8601UTCDateString =
  `${number}-${number}-${number}${'T' | ' '}${number}:${number}:${number}.${number}Z`;

export type WebhookRecord = {
  sessionId: string;
  timestamp: ISO8601UTCDateString; // ISO 8601 UTC string
  path: string;
  method: string;
  headers: Record<string, string | undefined>;
  body: string;
};

export type WebhookRecordResponse = {
  success: boolean;
  message: string;
  record?: WebhookRecord;
};

export type WebhookRetrieveResponse = {
  success: boolean;
  records: WebhookRecord[];
  count: number;
};

export type WebhookDeleteResponse = {
  success: boolean;
  message: string;
  deletedCount: number;
};

export type WebhookResponse =
  | WebhookRecordResponse
  | WebhookRetrieveResponse
  | WebhookDeleteResponse;
