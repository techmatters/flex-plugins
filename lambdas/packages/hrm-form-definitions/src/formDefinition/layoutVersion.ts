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

/**
 * Type that gives extra info on how a single field should be formatted
 */
export type LayoutValue = {
  includeLabel: boolean;
  format?: 'date' | 'string' | 'file' | 'timestamp' | 'duration-from-seconds';
  valueTemplateCode?: string; // If specified, this template code will be used to render a value, with all form values passed as parameters
  labelTemplateCode?: string; // If specified, this template code will be used to render a label
  widthRatio?: number;
};
export type LayoutDefinition = {
  previewFields?: string[];
  layout?: { [name: string]: LayoutValue };
  splitFormAt?: number;
  caseHomeOrder?: number;
  printOrder?: number;
  caseHomeLocation?: 'list' | 'timeline' | 'hidden';
  printFormat?: 'tabular' | 'list' | 'hidden';
  timelineIcon?: string;
};
export type LayoutVersion = {
  contact: {
    callerInformation: LayoutDefinition;
    childInformation: LayoutDefinition;
    caseInformation: LayoutDefinition;
  };
  case: {
    hideCounselorDetails?: boolean;
    sectionTypes: Record<string, LayoutDefinition>;
  };
  thaiCharacterPdfSupport?: boolean;
};
