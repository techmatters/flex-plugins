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

type SectionHelp = { slug: string; what: string };

// The article about the section open, set by the workspace for the section's title to link to
export const SectionHelpContext = createContext<SectionHelp | undefined>(undefined);

// "Need help?", opening the article about a section
export const NeedHelp = ({ slug, what }: SectionHelp) => {
  const openHelp = useContext(HelpContext);
  if (!openHelp || !articleBySlug(slug)) return null;
  return (
    <button
      type="button"
      className="need-help"
      aria-label={`Need help with ${what}?`}
      title={`What ${what} is for, and how to change it`}
      onClick={() => openHelp(slug)}
    >
      <CircleHelp size={14} aria-hidden /> Need help?
    </button>
  );
};

// A section editor's title, with "Need help?" to its right when the section has an article
export const SectionTitle = ({ id, children }: { id?: string; children: React.ReactNode }) => {
  const sectionHelp = useContext(SectionHelpContext);
  return (
    <div className="section-title-row">
      <h2 id={id}>{children}</h2>
      {sectionHelp && <NeedHelp slug={sectionHelp.slug} what={sectionHelp.what} />}
    </div>
  );
};
