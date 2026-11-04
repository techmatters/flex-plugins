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
 * Lets the browser bundle (and the tests) use the form specification and validator from
 * lambdas/packages/hrm-form-definitions/src without pulling in its Node-only loader.
 *
 * aseloForms.ts and specification/*.ts import from '../formDefinition' (the folder index),
 * which also re-exports loadDefinition.ts (uses 'path' and lodash). Everything they actually
 * use at runtime (the FormInputType enum) lives in formDefinition/types.ts, so imports of
 * the folder index made from inside the package are redirected there.
 * The package itself is not modified.
 */
const path = require('path');

const hrmFormDefinitionsSrc = path.resolve(__dirname, '../../../lambdas/packages/hrm-form-definitions/src');
const formDefinitionIndexDir = path.join(hrmFormDefinitionsSrc, 'formDefinition');
const formDefinitionTypesFile = path.join(formDefinitionIndexDir, 'types.ts');

// Where an import should go instead, if it's one of those (undefined otherwise)
const redirectOf = (request, fromDir) => {
  // (Jest gives Windows paths with forward slashes: path.resolve spells them the usual way)
  const from = path.resolve(fromDir);
  const insidePackage = from === hrmFormDefinitionsSrc || from.startsWith(hrmFormDefinitionsSrc + path.sep);
  if (!request.startsWith('.') || !insidePackage) return undefined;
  return path.resolve(from, request) === formDefinitionIndexDir ? formDefinitionTypesFile : undefined;
};

// For webpack: a NormalModuleReplacementPlugin doing the redirect
const hrmFormDefinitionsReplacement = (webpack) =>
  new webpack.NormalModuleReplacementPlugin(/formDefinition$/, (resource) => {
    const redirect = redirectOf(resource.request, resource.context);
    if (redirect) resource.request = redirect;
  });

module.exports = { hrmFormDefinitionsSrc, redirectOf, hrmFormDefinitionsReplacement };
