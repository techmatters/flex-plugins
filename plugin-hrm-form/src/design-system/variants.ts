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

/**
 * Visual variants shared by design system components.
 * - default: neutral, white background
 * - guidance: yellow, for guidance shown to counsellors (e.g. queue greetings)
 */
export type Variant = 'default' | 'guidance';

export const textColor = '#192b33';

export const variantBackgroundColors: Record<Variant, string> = {
  default: '#ffffff',
  guidance: '#fffeef',
};
