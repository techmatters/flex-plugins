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
 * The people lists tasks are assigned from: one per helpline, and the Aselo team's. People are
 * added when they open a board; here they can also be added (before they've signed in) or
 * removed. Helpline staff manage their own helpline's list; the Aselo team's is Aselo staff's.
 */
import { useEffect, useState } from 'react';
import type { BoardClient } from './boardClient';
import { ASELO_PEOPLE_CODE, Person } from './model';

type Props = {
  client: BoardClient;
  helplineCodes: string[];
  isAseloStaff: boolean;
};

export const PeopleManager = ({ client, helplineCodes, isAseloStaff }: Props) => {
  const codes = isAseloStaff ? [ASELO_PEOPLE_CODE, ...helplineCodes] : helplineCodes;
  const [code, setCode] = useState(codes[0] ?? '');
  const [people, setPeople] = useState<Person[]>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const canEdit = code !== ASELO_PEOPLE_CODE || isAseloStaff;

  useEffect(() => {
    if (!code) return;
    setPeople(undefined);
    setError(undefined);
    client
      .people(code)
      .then(setPeople)
      .catch((err: Error) => setError(err.message));
  }, [client, code]);

  const save = async (updated: Person[]) => {
    setError(undefined);
    try {
      setPeople(await client.savePeople(code, updated));
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  };

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !people) return;
    const person = { name: name.trim(), ...(email.trim() ? { email: email.trim() } : {}) };
    if (await save([...people, person])) {
      setName('');
      setEmail('');
    }
  };

  if (codes.length === 0) return null;

  return (
    <section className="flows-people">
      <h3>People</h3>
      <p className="field-hint">
        Who tasks on the boards can be assigned to. Everyone is added when they first open a board; add people here
        before then, or remove those who&apos;ve left.
      </p>
      <label className="field">
        <span className="field-label">List</span>
        <select value={code} onChange={(e) => setCode(e.target.value)}>
          {codes.map((candidate) => (
            <option key={candidate} value={candidate}>
              {candidate === ASELO_PEOPLE_CODE ? 'Aselo team' : candidate.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
      {error && <div className="alert alert-error">{error}</div>}
      {!people && !error && <p>Loading…</p>}
      {people && (
        <ul className="flows-list" aria-label="People">
          {people.length === 0 && <li className="field-hint">Nobody yet.</li>}
          {people.map((person) => (
            <li key={person.email ?? person.name}>
              <span>{person.name}</span>
              <span className="field-hint">{person.email ?? 'no email'}</span>
              {canEdit && (
                <button
                  type="button"
                  className="link-button danger"
                  aria-label={`Remove ${person.name}`}
                  onClick={() => save(people.filter((other) => other !== person))}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {people && canEdit && (
        <form className="flows-people-add" onSubmit={add}>
          <input
            type="text"
            aria-label="Name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            aria-label="Email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="secondary-button" disabled={!name.trim()}>
            Add
          </button>
        </form>
      )}
    </section>
  );
};
