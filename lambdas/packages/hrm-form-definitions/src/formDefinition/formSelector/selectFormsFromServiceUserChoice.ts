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

import { PrepopulateContactFormSelector } from './prepopulateContactFormSelector';

enum FormAbout {
  Self = 1,
  Other = 2,
}

const lookupServiceUserChoice = (
  preEngagementSelections: Record<string, string>,
  surveyAnswers: Record<string, string>,
  choiceLocations: { form: string; input: string; aboutSelfValue: string }[],
) => {
  for (const { form, input, aboutSelfValue = 'Yes' } of choiceLocations) {
    const choice = (form === 'preEngagement' ? preEngagementSelections : surveyAnswers)?.[input];
    if (choice) {
      return choice === aboutSelfValue ? FormAbout.Self : FormAbout.Other;
    }
  }
};

export const selectFormsFromServiceUserChoice: PrepopulateContactFormSelector = (
  choiceLocations = [{ form: 'survey', input: 'aboutSelf', aboutSelfValue: 'Yes' }],
) => ({
  selectForms: (source, preEngagementSelections, surveyAnswers) => {
    const serviceUserChoice = lookupServiceUserChoice(
      preEngagementSelections,
      surveyAnswers,
      choiceLocations,
    );
    switch (serviceUserChoice) {
      case FormAbout.Self: {
        return ['CaseInformationTab', 'ChildInformationTab'];
      }
      case FormAbout.Other: {
        return ['CaseInformationTab', 'CallerInformationTab'];
      }
      default: {
        return source === 'survey' ? ['CaseInformationTab'] : ['CaseInformationTab', 'ChildInformationTab'];
      }
    },
  selectCallType: (preEngagementSelections, surveyAnswers) => {
    const serviceUserChoice = lookupServiceUserChoice(
      preEngagementSelections,
      surveyAnswers,
      choiceLocations,
    );
    return serviceUserChoice === FormAbout.Other
      ? 'Someone calling about a child'
      : 'Child calling about self';
  },
});
