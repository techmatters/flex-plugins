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

export type KhpOperationsDay = {
  key: string;
  day: string;
  hoursOfOperation: string | null;
  descriptionOfHours: string | null;
};

export type KhpUiResource = {
  resourceSid: string;
  name: string;
  attributes: {
    nameDetails: string;
    notes: string[];
    recordType: string;
    taxonomies: string[];
    status: string;
    taxonomyCode: string;
    description: string;
    mainContact: {
      mainContactText: string;
      isPrivate: boolean;
    };
    website: string;
    available247: string;
    ageRange: string;
    targetPopulation: string;
    interpretationTranslationServicesAvailable: string;
    feeStructureSource: string | null;
    howToAccessSupport: string;
    applicationProcess: string;
    howIsServiceOffered: string;
    languagesServiced: string;
    accessibility: string;
    documentsRequired: string;
    primaryLocationIsPrivate: boolean;
    primaryLocation: string;
    phoneNumbers: {
      description: string;
      type: string;
      isPrivate: boolean;
      name: string;
      number: string;
    }[];
    operations: KhpOperationsDay[];
    coverage: string;
    eligibilityPhrase: string;
    site: {
      siteId: string;
      name: string;
      location: {
        address1: string;
        address2: string | null;
        city: string;
        county: string;
        postalCode: string;
        province: string;
        country: string;
        isPrivate: boolean;
      };
      phoneNumbers: {
        [key: string]: string;
      };
      email: string;
      operations: KhpOperationsDay[];
      isActive: boolean;
      details: string;
      coverage: string;
    }[];
  };
};

export type Language = 'en' | 'fr' | '';
