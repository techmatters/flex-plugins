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
 * Who works on each helpline, so tasks can be assigned to them: one list per helpline, plus one
 * for the Aselo team (ASELO_PEOPLE_CODE). People are added when they open a board, and the lists
 * can be edited in the builder.
 *
 *   <root>/<code>.json      locally, in form-builder/people (gitignored)
 *   people/<code>.json      deployed, in the private drafts bucket
 */
import { promises as fs } from 'fs';
import path from 'path';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Person } from '../src/flows/model';
import { ASELO_PEOPLE_CODE } from '../src/flows/model';

export type { Person };
export { ASELO_PEOPLE_CODE };

export interface PeopleStore {
  get(code: string): Promise<Person[]>;
  put(code: string, people: Person[]): Promise<void>;
}

export const isValidPeopleCode = (code: string) => code === ASELO_PEOPLE_CODE || /^[a-z0-9]+$/.test(code);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A clean list: names trimmed, emails lower case, one entry per email (or per name, without one)
export const normalizePeople = (people: unknown): Person[] | undefined => {
  if (!Array.isArray(people)) return undefined;
  const seen = new Set<string>();
  const result: Person[] = [];
  for (const candidate of people) {
    const name = typeof candidate?.name === 'string' ? candidate.name.trim() : '';
    const email = typeof candidate?.email === 'string' ? candidate.email.trim().toLowerCase() : '';
    if (!name || (email && !EMAIL_PATTERN.test(email))) return undefined;
    const key = email || name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(email ? { name, email } : { name });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
};

// The same person: by email when both have one, otherwise by name
export const samePerson = (a: Person, b: Person) =>
  a.email && b.email ? a.email.toLowerCase() === b.email.toLowerCase() : a.name.toLowerCase() === b.name.toLowerCase();

/**
 * Adds the person to the list if they aren't on it yet (filling in an email that was missing).
 * Returns whether the list changed.
 */
export const registerPerson = async (store: PeopleStore, code: string, person: Person): Promise<boolean> => {
  const people = await store.get(code);
  const existing = people.find((candidate) => samePerson(candidate, person) || candidate.name === person.name);
  if (existing && (existing.email || !person.email)) return false;
  const updated = existing
    ? people.map((candidate) => (candidate === existing ? { ...candidate, email: person.email } : candidate))
    : [...people, person];
  await store.put(code, normalizePeople(updated) ?? people);
  return true;
};

export class LocalPeopleStore implements PeopleStore {
  constructor(private readonly rootDir: string) {}

  private file(code: string) {
    if (!isValidPeopleCode(code)) throw new Error(`Invalid helpline ${code}`);
    return path.join(this.rootDir, `${code}.json`);
  }

  async get(code: string): Promise<Person[]> {
    try {
      return JSON.parse(await fs.readFile(this.file(code), 'utf8')) as Person[];
    } catch {
      return [];
    }
  }

  async put(code: string, people: Person[]): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
    await fs.writeFile(this.file(code), `${JSON.stringify(people, null, 2)}\n`);
  }
}

export class MemoryPeopleStore implements PeopleStore {
  private lists = new Map<string, Person[]>();

  async get(code: string) {
    return structuredClone(this.lists.get(code) ?? []);
  }

  async put(code: string, people: Person[]) {
    this.lists.set(code, structuredClone(people));
  }
}

export class S3PeopleStore implements PeopleStore {
  constructor(
    private readonly bucket: string,
    private readonly s3: Pick<S3Client, 'send'> = new S3Client({}),
  ) {}

  private key(code: string) {
    if (!isValidPeopleCode(code)) throw new Error(`Invalid helpline ${code}`);
    return `people/${code}.json`;
  }

  async get(code: string): Promise<Person[]> {
    try {
      const response = await this.s3.send(new GetObjectCommand({ Bucket: this.bucket, Key: this.key(code) }));
      return JSON.parse(await response.Body!.transformToString()) as Person[];
    } catch (err) {
      if ((err as Error).name === 'NoSuchKey') return [];
      throw err;
    }
  }

  async put(code: string, people: Person[]): Promise<void> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: this.key(code),
        Body: JSON.stringify(people),
        ContentType: 'application/json',
      }),
    );
  }
}
