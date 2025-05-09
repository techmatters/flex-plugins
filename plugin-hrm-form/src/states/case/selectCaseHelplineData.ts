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
import { HelplineEntry } from '@tech-matters/hrm-form-definitions';

import { RootState } from '..';
import { Case } from '../../types/types';
import { selectDefinitionVersionForCase } from '../configuration/selectDefinitions';
import { selectCaseByCaseId } from './selectCaseStateByCaseId';

const selectCaseHelplineData = (state: RootState, caseId: Case['id']): HelplineEntry | undefined => {
  const { connectedCase } = selectCaseByCaseId(state, caseId) ?? {};
  if (connectedCase) {
    const { helpline } = connectedCase;
    const { helplineInformation } = selectDefinitionVersionForCase(state, connectedCase) ?? {};

    if (helpline && helplineInformation) return helplineInformation.helplines.find(x => x.value === helpline);
  }
  return undefined;
};

export default selectCaseHelplineData;
