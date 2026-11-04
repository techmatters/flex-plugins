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
 * Lets the browser bundle use the form specification and validator from
 * lambdas/packages/hrm-form-definitions/src without pulling in its Node-only loader.
 *
 * aseloForms.ts and specification/*.ts import from '../formDefinition' (the folder index),
 * which also re-exports loadDefinition.ts (uses 'path' and lodash). Everything they actually
 * use at runtime (the FormInputType enum) lives in formDefinition/types.ts, so imports of
 * the folder index made from inside the package are redirected there.
 * The package itself is not modified.
 */
import path from 'path';
import type { Plugin } from 'vite';

export const hrmFormDefinitionsResolver = (packageSrcDir: string): Plugin => {
  const formDefinitionIndexDir = path.join(packageSrcDir, 'formDefinition');
  const formDefinitionTypesFile = path.join(formDefinitionIndexDir, 'types.ts');

  return {
    name: 'hrm-form-definitions-resolver',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.')) return null;
      const importerPath = path.resolve(importer.split('?')[0]);
      if (!importerPath.startsWith(packageSrcDir + path.sep)) return null;
      const target = path.resolve(path.dirname(importerPath), source);
      return target === formDefinitionIndexDir ? formDefinitionTypesFile : null;
    },
  };
};
