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
import { useSelector } from 'react-redux';

import { localizeKey } from './localizeKey';
import { selectCurrentTranslations } from '../store/config.reducer';

const LocalizedTemplate: React.FC<{ code: string; renderAsHtml?: string | boolean } & Record<string, string>> = ({
  code,
  renderAsHtml,
  ...parameters
}) => {
  const translations = useSelector(selectCurrentTranslations);
  const translateForCurrentLocale = localizeKey(translations);
  const shouldRenderAsHtml =
    typeof renderAsHtml === 'string'
      ? renderAsHtml.trim().toLowerCase() === 'true'
      : Boolean(renderAsHtml);
  if (shouldRenderAsHtml) {
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{ __html: translateForCurrentLocale(code, parameters) }} />;
  }
  return <>{translateForCurrentLocale(code, parameters)}</>;
};

export default LocalizedTemplate;
