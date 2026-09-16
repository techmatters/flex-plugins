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

import { newErr, newOk } from '@tech-matters/result-type';
import type { ExternalTaskMappingFunction } from '.';
import { callTypes } from '@tech-matters/hrm-types';
import { populateInitialValues } from '../populateInitialValues';
import { getCurrentDefinitionVersion } from '../formDefinitionsCache';

const concatFields = (fields: { label: string; value: string }[]) =>
  fields.map(({ label, value }) => `${label}: ${value}`).join('\n');

export const mappingFunction: ExternalTaskMappingFunction = async ({
  accountSid,
  contact,
  taskAttributes,
}) => {
  try {
    console.log('[mappingFunction] filling contact with USCR mapping');
    const definitionVersion = await getCurrentDefinitionVersion({ accountSid });
    await populateInitialValues(contact, definitionVersion);

    const { externalTaskAttributes } = taskAttributes;

    const {
      customerId,
      comments: commentsArray,
      // subjects,
      // whenCreated,
      dispatch,
    } = externalTaskAttributes;

    const address = dispatch?.location?.address || {};
    const addressIntersection = {
      label: 'Address/Intersection ',
      value: address.fullText,
    };
    const addressCity = {
      label: 'City',
      value: address.city,
    };
    const addressState = {
      label: 'State',
      value: address.state,
    };
    const addressZip = {
      label: 'Zip',
      value: address.zip,
    };
    const specificLocation = concatFields([
      addressIntersection,
      addressCity,
      addressState,
      addressZip,
    ]);

    const addressApartment = { label: 'Apartment/Suite', value: address.apartment };
    const addressLatLong = {
      label: 'Latitude/Longitude',
      value: `${address.latitude}, ${address.longitude}`,
    };
    const addressCrossStreet = { label: 'Cross Streets', value: address.crossStreet };
    const commentsValues = (
      (commentsArray as { text: string; whenEntered: string; author: string }[]) || []
    ).map((comment, idx) => {
      const commentAuthor = { label: 'Unit Call Sign', value: comment?.author };
      const commentText = { label: 'Comment', value: comment?.text };
      return `Comment ${idx}` + `\n` + concatFields([commentAuthor, commentText]);
    });
    const comments = {
      label: 'Incident Comments',
      value: ['', ...commentsValues].join('\n'),
    };
    const incidentSummary = concatFields([
      addressApartment,
      addressLatLong,
      addressCrossStreet,
      comments,
    ]);

    // Jurisdiction	jurisdiction.areaKey + jurisdiction.areaCode + jurisdiction.areaDescription
    // TODO: the target field is a select, can't fill with free text
    // const jurisdiction = address.jurisdiction || {};

    contact.rawJson.callType = callTypes.caller;
    contact.rawJson.callerInformation.identifier911 = customerId;
    contact.rawJson.childInformation.specificLocation = specificLocation;
    contact.rawJson.childInformation.incidentSummary = incidentSummary;

    console.log(
      '[mappingFunction] Success filling contact',
      JSON.stringify(contact, null, 2),
    );

    return newOk(contact);
  } catch (err) {
    const message = `mappingFunction: unexpected error ocurred ${err instanceof Error ? err.message : String(err)}`;
    return newErr({ message, error: err instanceof Error ? err : new Error(message) });
  }
};
