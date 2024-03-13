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

import { DefinitionVersion } from 'hrm-form-definitions';

import { Activity, ContactActivity } from './types';
import { Contact } from '../../types/types';
import { channelTypes } from '../DomainConstants';
import { getTemplateStrings } from '../../hrmConfig';
import { FullCaseSection } from '../../services/caseSectionService';

const ActivityTypes = {
  createCase: 'create',
  addNote: 'note',
  addReferral: 'referral',
  connectContact: {
    ...channelTypes,
    default: 'default',
  },
  unknown: 'unknown',
} as const;

/**
 * Returns true if the activity provided represents a contact that was connected to the case
 * @param activity Timeline Activity
 */
export const isContactActivity = (activity: Activity): activity is ContactActivity =>
  Boolean((activity as ContactActivity).contactId);

export const getSectionText = ({ sectionTypeSpecificData }: FullCaseSection, formDefs: DefinitionVersion): string => {
  let { previewFields } = formDefs.layoutVersion.case.notes ?? {};
  if (!previewFields || !previewFields.length) {
    previewFields = formDefs.caseForms.NoteForm.length ? [formDefs.caseForms.NoteForm[0].name] : [];
  }
  return (
    previewFields
      .map(pf => sectionTypeSpecificData[pf])
      .filter(pv => pv)
      .join(', ') || '--'
  );
};

export const getContactActivityText = (contact: Contact, strings: Record<string, string>): string => {
  if (contact.rawJson.caseInformation.callSummary) {
    return contact.rawJson.caseInformation.callSummary.toString();
  }
  if (!contact.finalizedAt) {
    return strings['Case-Timeline-DraftContactSummaryPlaceholder'] ?? '';
  }
  return '';
};

const connectedContactActivities = (caseContacts: Contact[]): ContactActivity[] => {
  const strings = getTemplateStrings();
  return (caseContacts || [])
    .map(cc => {
      try {
        const type = ActivityTypes.connectContact[cc.channel];
        const channel = type === ActivityTypes.connectContact.default ? cc.rawJson.contactlessTask.channel : type;
        return {
          contactId: cc.id.toString(),
          date: cc.timeOfContact,
          createdAt: cc.createdAt,
          type,
          text: getContactActivityText(cc, strings),
          twilioWorkerId: cc.twilioWorkerId,
          channel,
          callType: cc.rawJson.callType,
          isDraft: !cc.finalizedAt,
        };
      } catch (err) {
        console.warn(`Error processing connected contact, excluding from data`, cc, err);
        return null;
      }
    })
    .filter(cca => cca);
};

export const getActivitiesFromContacts = (sourceContacts: Contact[]): Activity[] => {
  return connectedContactActivities(sourceContacts);
};
