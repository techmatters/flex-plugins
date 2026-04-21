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
import DOMPurify from 'dompurify';
import { useSelector } from 'react-redux';

import { localizeKey } from './localizeKey';
import { selectCurrentTranslations } from '../store/config.reducer';

/**
 * Sanitization config that only allows links and text decoration tags.
 * Blocks scripts, event handlers, javascript: URLs and all other unsafe content.
 */
const SANITIZE_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['a', 'b', 'i', 'em', 'strong', 'u', 's', 'span', 'br'],
  ALLOWED_ATTR: ['href', 'rel'],
};

const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html, SANITIZE_CONFIG) as string;

const LocalizedTemplate: React.FC<{ code: string; renderAsHtml?: string } & Record<string, string>> = ({
  code,
  renderAsHtml,
  ...parameters
}) => {
  const translations = useSelector(selectCurrentTranslations);
  const translateForCurrentLocale = localizeKey(translations);
  if (renderAsHtml?.toLowerCase() === 'true') {
    const safeHtml = sanitizeHtml(translateForCurrentLocale(code, parameters));
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  return <>{translateForCurrentLocale(code, parameters)}</>;
};

export default LocalizedTemplate;
