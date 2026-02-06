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
import { buildFormDefinitionsBaseUrlGetter, loadWebchatDefinition, PreEngagementForm } from 'hrm-form-definitions';

// eslint-disable-next-line import/no-unused-modules
export const getDefinitionVersion = async ({
  definitionVersionId,
  environment,
}: {
  definitionVersionId: string;
  environment: string;
}): Promise<{
  preEngagementForm: PreEngagementForm;
}> => {
  const formDefinitionsBaseUrl = buildFormDefinitionsBaseUrlGetter({ environment })(definitionVersionId);
  // eslint-disable-next-line
  const definition = await loadWebchatDefinition(formDefinitionsBaseUrl);
  return definition;
};
