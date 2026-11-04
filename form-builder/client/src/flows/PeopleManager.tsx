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
 * The people lists tasks are assigned from: one per helpline, the only one its boards offer. Every
 * list is filled by hand here; nobody is added by signing in. The Aselo team's list is where Aselo
 * staff are picked from to join the helplines they work on. Helpline staff manage their own
 * helpline's list; the Aselo team's is Aselo staff's.
 */
import { Loading } from '../common/Loading';
import { ASELO_PEOPLE_CODE, Person } from '@tech-matters/form-builder-shared/flows/model';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectActingAsStaff } from '../app/sessionSlice';
import { addPerson, choosePeopleList, personTyped, savePeople, selectFlows, selectPeopleCodes } from './flowsSlice';

export const PeopleManager = () => {
  const dispatch = useAppDispatch();
  const isAseloStaff = useAppSelector(selectActingAsStaff);
  // Helplines first: their lists are the ones boards offer
  const codes = useAppSelector(selectPeopleCodes);
  const { code, people, name, email, error, team } = useAppSelector(selectFlows).people;
  const canEdit = code !== ASELO_PEOPLE_CODE || isAseloStaff;
  const save = (updated: Person[]) => dispatch(savePeople(updated));

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    void dispatch(addPerson());
  };

  const onList = (person: Person) =>
    people?.some(other =>
      other.email && person.email
        ? other.email === person.email
        : other.name.toLowerCase() === person.name.toLowerCase(),
    );
  const teamToAdd = code === ASELO_PEOPLE_CODE ? [] : team.filter(person => !onList(person));

  if (codes.length === 0) return null;

  return (
    <section className="flows-people">
      <h3>People</h3>
      <p className="field-hint">
        Who tasks on a helpline&apos;s boards can be assigned to. Nobody is added automatically: add each
        helpline&apos;s team members (and the Aselo staff working on it) here, and remove those who&apos;ve left.
      </p>
      <label className="field">
        <span className="field-label">List</span>
        <select value={code} onChange={e => dispatch(choosePeopleList(e.target.value))}>
          {codes.map(candidate => (
            <option key={candidate} value={candidate}>
              {candidate === ASELO_PEOPLE_CODE
                ? 'Aselo team (to add to helplines, and templates)'
                : candidate.toUpperCase()}
            </option>
          ))}
        </select>
      </label>
      {error && <div className="alert alert-error">{error}</div>}
      {!people && !error && <Loading text="Loading…" />}
      {people && (
        <ul className="flows-list" aria-label="People">
          {people.length === 0 && <li className="field-hint">Nobody yet.</li>}
          {people.map(person => (
            <li key={person.email ?? person.name}>
              <span>{person.name}</span>
              <span className="field-hint">{person.email ?? 'no email'}</span>
              {canEdit && (
                <button
                  type="button"
                  className="link-button danger"
                  aria-label={`Remove ${person.name}`}
                  onClick={() => save(people.filter(other => other !== person))}
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
            onChange={e => dispatch(personTyped({ name: e.target.value }))}
          />
          <input
            type="email"
            aria-label="Email"
            placeholder="Email (optional)"
            value={email}
            onChange={e => dispatch(personTyped({ email: e.target.value }))}
          />
          <button type="submit" className="secondary-button" disabled={!name.trim()}>
            Add
          </button>
        </form>
      )}
      {people && canEdit && teamToAdd.length > 0 && (
        <label className="field">
          <span className="field-label">Add from the Aselo team</span>
          <select
            value=""
            onChange={e => {
              const person = teamToAdd.find(candidate => (candidate.email ?? candidate.name) === e.target.value);
              if (person) void save([...people, person]);
            }}
          >
            <option value="">Choose someone…</option>
            {teamToAdd.map(person => (
              <option key={person.email ?? person.name} value={person.email ?? person.name}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </section>
  );
};
