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

import { AvailableContactFormSelector } from './availableContactFormSelector';

export const selectFormsFromAboutSelfSurveyQuestion: AvailableContactFormSelector = () => (
  source,
  _preEngagementSelections,
  surveyAnswers,
) => {
  if (source === 'survey') {
    if (surveyAnswers?.aboutSelf === 'Yes') {
      return ['CaseInformationTab', 'ChildInformationTab'];
    } else if (surveyAnswers?.aboutSelf) {
      return ['CaseInformationTab', 'CallerInformationTab'];
    }
    return ['CaseInformationTab'];
  } else {
    if (surveyAnswers?.aboutSelf === 'Yes' || !surveyAnswers?.aboutSelf) {
      return ['CaseInformationTab', 'ChildInformationTab'];
    }
    return ['CaseInformationTab', 'CallerInformationTab'];
  }
};
