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

import { DefinitionVersion } from '@tech-matters/hrm-form-definitions';
import { RecursivePartial } from './unit/RecursivePartial';

export type FormDefinitionSet = Pick<
  DefinitionVersion,
  'prepopulateKeys' | 'prepopulateMappings' | 'helplineInformation'
> & {
  childInformation: DefinitionVersion['tabbedForms']['ChildInformationTab'];
  callerInformation: DefinitionVersion['tabbedForms']['CallerInformationTab'];
  caseInformation: DefinitionVersion['tabbedForms']['CaseInformationTab'];
};

export type FormDefinitionPatch = Partial<
  Omit<DefinitionVersion, 'prepopulateKeys' | 'prepopulateMappings'>
> & {
  prepopulateKeys?: RecursivePartial<DefinitionVersion['prepopulateKeys']>;
  prepopulateMappings?: Partial<DefinitionVersion['prepopulateMappings']>;
};
