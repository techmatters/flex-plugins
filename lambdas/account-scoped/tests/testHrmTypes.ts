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

import {
  FormItemDefinition,
  PrepopulateKeys,
} from '../src/hrm/populateHrmContactFormFromTask';
import { RecursivePartial } from './unit/RecursivePartial';

export type FormDefinitionSet = {
  childInformation: FormItemDefinition[];
  callerInformation: FormItemDefinition[];
  caseInformation: FormItemDefinition[];
  prepopulateKeys: PrepopulateKeys;
  helplineInformation: {
    label: string;
    helplines: {
      label: string;
      value: string;
    }[];
  };
};
export type FormDefinitionPatch = Partial<Omit<FormDefinitionSet, 'prepopulateKeys'>> & {
  prepopulateKeys?: RecursivePartial<PrepopulateKeys>;
};
