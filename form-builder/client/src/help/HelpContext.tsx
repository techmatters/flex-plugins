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
 * Opening the Help panel from anywhere in the builder, at an article: e.g. a section's "Need
 * help?". Without the panel (a test rendering one screen), there's nothing to open and the links
 * don't show.
 */
import { createContext, useContext } from 'react';
import { CircleHelp } from 'lucide-react';
import { articleBySlug } from './articles';

export const HelpContext = createContext<((slug?: string) => void) | undefined>(undefined);

// "Need help?" at the top of a section, opening the article about it
export const NeedHelp = ({ slug, what }: { slug: string; what: string }) => {
  const openHelp = useContext(HelpContext);
  if (!openHelp || !articleBySlug(slug)) return null;
  return (
    <div className="need-help-row">
      <button
        type="button"
        className="need-help"
        aria-label={`Need help with ${what}?`}
        title={`What ${what} is for, and how to change it`}
        onClick={() => openHelp(slug)}
      >
        <CircleHelp size={14} aria-hidden /> Need help?
      </button>
    </div>
  );
};
