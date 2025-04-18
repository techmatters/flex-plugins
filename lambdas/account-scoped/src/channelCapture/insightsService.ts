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

import { get } from 'lodash';
import type { LexMemory } from './lexClient';

type BotMemory = LexMemory;

type InsightsAttributes = {
  conversations?: { [key: string]: string | number };
  customers?: { [key: string]: string | number };
};

type TaskAttributes = {} & InsightsAttributes;

type InsightsObject = 'customers' | 'conversations';

// Each of this ConfigSpec maps (possibly) many form field to one insights attribute
export type OneToManyConfigSpec = {
  insightsObject: InsightsObject; // In which attributes object this goes
  attributeName: string; // Which name the property receives in above object (e.g. customer_attribute_1)
  questions: string[]; // Array of questions names (as they are named in the bot definition) to grab and concatenate to drop in above property
};

type SurveyInsightsUpdateFunction = (memory: BotMemory) => InsightsAttributes;

const delimiter = ';';

const mergeAttributes = (
  previousAttributes: TaskAttributes,
  newAttributes: InsightsAttributes,
): TaskAttributes => ({
  ...previousAttributes,
  conversations: {
    ...previousAttributes.conversations,
    ...newAttributes.conversations,
  },
  customers: {
    ...previousAttributes.customers,
    ...newAttributes.customers,
  },
});

const applyCustomUpdate =
  (
    customUpdate: OneToManyConfigSpec,
    pathBuilder: (question: string) => string,
  ): SurveyInsightsUpdateFunction =>
  memory => {
    const updatePaths = customUpdate.questions.map(pathBuilder);
    // concatenate the values, taken from dataSource using paths (e.g. 'contactForm.childInformation.province')
    const value = updatePaths.map(path => get(memory, path, '')).join(delimiter);

    return {
      [customUpdate.insightsObject]: {
        [customUpdate.attributeName]: value,
      },
    };
  };

const bindApplyCustomUpdates = (
  oneToManyConfigSpecs: OneToManyConfigSpec[],
  pathBuilder: (question: string) => string,
): SurveyInsightsUpdateFunction[] => {
  const customUpdatesFuns = oneToManyConfigSpecs.map(spec =>
    applyCustomUpdate(spec, pathBuilder),
  );

  return customUpdatesFuns;
};

export const buildSurveyInsightsData = (
  oneToManyConfigSpecs: OneToManyConfigSpec[],
  taskAttributes: TaskAttributes,
  memory: BotMemory,
  pathBuilder: (question: string) => string = q => q,
) => {
  const applyCustomUpdates = bindApplyCustomUpdates(oneToManyConfigSpecs, pathBuilder);

  const finalAttributes: TaskAttributes = applyCustomUpdates
    .map(f => f(memory))
    .reduce(
      (acc: TaskAttributes, curr: InsightsAttributes) => mergeAttributes(acc, curr),
      taskAttributes,
    );

  return finalAttributes;
};

export type BuildSurveyInsightsData = typeof buildSurveyInsightsData;
