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

export enum InsightsObject {
  Customers = 'customers',
  Conversations = 'conversations',
}
export enum FieldType {
  MixedCheckbox = 'mixed-checkbox',
}
export type InsightsFieldSpec = {
  name: string;
  insights: [InsightsObject, string];
  type?: FieldType;
};
type InsightsSubFormSpec = InsightsFieldSpec[];
export type InsightsFormSpec = { [key: string]: InsightsSubFormSpec };
// Each of this ConfigSpec maps one form field to one insights attribute
export type OneToOneConfigSpec = {
  contactForm?: InsightsFormSpec;
  caseForm?: InsightsFormSpec;
};

// Each of this ConfigSpec maps (possibly) many form field to one insights attribute
export type OneToManyConfigSpec = {
  insightsObject: InsightsObject; // In which attributes object this goes
  attributeName: string; // Which name the property receives in above object
  paths: string[]; // Array of paths to grab and concatenate to drop in above property
  saveForNonDataContacts?: boolean; // Allows the custom mapping to be saved for non-data contacts
};
export type OneToManyConfigSpecs = OneToManyConfigSpec[];
