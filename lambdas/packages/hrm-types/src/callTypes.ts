/**
 * Copyright (C) 2021-2023 Technology Matters
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

// Data callTypes. Preserving name to avoid big refactor
export const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
} as const;

export type DataCallTypesKeys = keyof typeof callTypes;
export type CallTypeKeys = DataCallTypesKeys | string; // This results in "strings" as it's a broader type. Leaving the DataCallTypesKeys in intentionally to emphasize them.
export type DataCallTypes = (typeof callTypes)[keyof typeof callTypes];
export type CallTypes = DataCallTypes | string; // This results in "strings" as it's a broader type. Leaving the DataCallTypes in intentionally to emphasize them.
