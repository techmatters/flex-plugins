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
  PrepopulateContactFormSelector,
  ContactFormDefinitionName,
  ContactFormName,
  staticAvailableContactTabSelector,
} from './prepopulateContactFormSelector';
import { selectFormsFromAboutSelfSurveyQuestion } from './selectFormsFromAboutSelfSurveyQuestion';
import { DefinitionVersion } from '../types';

export * from './prepopulateContactFormSelector';
export * from './selectFormsFromAboutSelfSurveyQuestion';

const SELECTOR_MAP: Record<string, PrepopulateContactFormSelector> = {
  staticSelector: staticAvailableContactTabSelector,
  surveyAnswerSelector: selectFormsFromAboutSelfSurveyQuestion,
};

const DEFAULT_SELECTOR = selectFormsFromAboutSelfSurveyQuestion;

export const lookupFormSelector = (
  prepopulateMappings: DefinitionVersion['prepopulateMappings'],
): ReturnType<PrepopulateContactFormSelector> => {
  const { formSelector } = prepopulateMappings;
  if (formSelector) {
    const { selectorType, parameter } = formSelector;
    return (SELECTOR_MAP[selectorType] ?? DEFAULT_SELECTOR)(parameter);
  } else {
    return DEFAULT_SELECTOR();
  }
};

// Hardcoded for now, will need to be configured if we move to configurable sets of contact forms
export const FORM_DEFINITION_MAP: { [x in ContactFormDefinitionName]: ContactFormName } = {
  ChildInformationTab: 'childInformation',
  CallerInformationTab: 'callerInformation',
  CaseInformationTab: 'caseInformation',
};
