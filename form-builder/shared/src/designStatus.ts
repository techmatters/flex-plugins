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
 * Where a design (a contact flows board, a routing design, a chatbot) is in its life, the same in
 * every area of the builder, so the team (and Claude) can tell what's being worked on and what's
 * ready to implement:
 *
 *   Imported -> In progress -> Ready for Claude -> Implemented
 *
 * Importing sets "Imported"; the first change makes it "In progress" (also when it was Ready or
 * Implemented: a changed design has to be marked ready again). Aselo staff set the others. "New"
 * isn't a status: it's shown next to it for designs that aren't in the live config yet.
 */
export type DesignStatus = 'imported' | 'in-progress' | 'ready' | 'implemented';

export const DESIGN_STATUSES: { value: DesignStatus; label: string; hint: string }[] = [
  { value: 'imported', label: 'Imported', hint: 'As it is live today: nothing changed yet.' },
  { value: 'in-progress', label: 'In progress', hint: 'Being designed: not ready to implement yet.' },
  {
    value: 'ready',
    label: 'Ready for Claude',
    hint: 'Finished and agreed with the helpline: Claude can implement it.',
  },
  {
    value: 'implemented',
    label: 'Implemented',
    hint: 'Written into the config (a pull request, then applied). Import again once it is live.',
  },
];

export const isDesignStatus = (value: unknown): value is DesignStatus =>
  DESIGN_STATUSES.some((status) => status.value === value);

export const statusLabel = (status: DesignStatus) =>
  DESIGN_STATUSES.find((candidate) => candidate.value === status)?.label ?? status;

// Any change to the design itself means it's being worked on again, whatever it was before
export const STATUS_AFTER_CHANGE: DesignStatus = 'in-progress';
