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
 * Questions the help panel couldn't answer, sent to the Aselo team by the person who asked (they
 * choose to send each one), so answers can be written for them. One file per month:
 *
 *   <root>/<yyyy-mm>.json            locally, in form-builder/help-questions (gitignored)
 *   help-questions/<yyyy-mm>.json    deployed, in the private drafts bucket
 *
 *   POST /api/help/questions    send one ({ question, area, article?, reason })
 *   GET  /api/help/questions    Aselo staff: the last three months', newest first
 */
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { ApiResponse, ApiUser } from './api';
import type { HelpQuestion } from '@tech-matters/form-builder-shared';
export type { HelpQuestion };

export interface HelpQuestionStore {
  get(month: string): Promise<HelpQuestion[]>;
  put(month: string, questions: HelpQuestion[]): Promise<void>;
}

const MONTH_PATTERN = /^\d{4}-\d{2}$/;
const monthOf = (date: Date) => date.toISOString().slice(0, 7);
const MAX_QUESTION_LENGTH = 500;

export class LocalHelpQuestionStore implements HelpQuestionStore {
  constructor(private readonly rootDir: string) {}

  private file(month: string) {
    if (!MONTH_PATTERN.test(month)) throw new Error(`Invalid month ${month}`);
    return path.join(this.rootDir, `${month}.json`);
  }

  async get(month: string): Promise<HelpQuestion[]> {
    try {
      return JSON.parse(await fs.readFile(this.file(month), 'utf8')) as HelpQuestion[];
    } catch {
      return [];
    }
  }

  async put(month: string, questions: HelpQuestion[]): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
    await fs.writeFile(this.file(month), `${JSON.stringify(questions, null, 2)}\n`);
  }
}

export class S3HelpQuestionStore implements HelpQuestionStore {
  constructor(private readonly bucket: string, private readonly s3: Pick<S3Client, 'send'> = new S3Client({})) {}

  private key(month: string) {
    if (!MONTH_PATTERN.test(month)) throw new Error(`Invalid month ${month}`);
    return `help-questions/${month}.json`;
  }

  async get(month: string): Promise<HelpQuestion[]> {
    try {
      const response = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(month) }));
      return JSON.parse(await response.Body!.transformToString()) as HelpQuestion[];
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return [];
      throw err;
    }
  }

  async put(month: string, questions: HelpQuestion[]): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(month),
        Body: JSON.stringify(questions),
        ContentType: 'application/json',
      }),
    );
  }
}

export const handleHelpRequest = async (
  store: HelpQuestionStore | undefined,
  method: string,
  body: unknown,
  user: ApiUser,
  now: () => Date,
): Promise<ApiResponse> => {
  if (!store) return { status: 501, body: { message: "Questions can't be sent from here." } };
  if (method === 'POST') {
    const { question, area, article, reason } = (body ?? {}) as Record<string, unknown>;
    const text = typeof question === 'string' ? question.trim() : '';
    if (!text || text.length > MAX_QUESTION_LENGTH) {
      return { status: 400, body: { message: `A question of up to ${MAX_QUESTION_LENGTH} characters is needed.` } };
    }
    const entry: HelpQuestion = {
      id: randomUUID(),
      question: text,
      area: typeof area === 'string' && /^[a-z]{1,20}$/.test(area) ? area : 'general',
      reason: reason === 'notHelpful' ? 'notHelpful' : 'unanswered',
      ...(typeof article === 'string' && /^[a-z0-9-]{1,80}$/.test(article) ? { article } : {}),
      askedBy: user.name,
      role: user.role,
      at: now().toISOString(),
    };
    const month = monthOf(now());
    await store.put(month, [...(await store.get(month)), entry]);
    return { status: 200, body: { id: entry.id } };
  }
  if (method === 'GET') {
    if (user.role !== 'aselo-staff') return { status: 403, body: { message: 'Only Aselo staff see these.' } };
    const today = now();
    const months = [0, 1, 2].map(back =>
      monthOf(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - back, 1))),
    );
    const questions = (await Promise.all(months.map(month => store.get(month)))).flat();
    return { status: 200, body: questions.sort((a, b) => b.at.localeCompare(a.at)) };
  }
  return { status: 405, body: { message: 'Not allowed.' } };
};
