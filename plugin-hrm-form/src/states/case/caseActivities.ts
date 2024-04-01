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

import { Activity, ContactActivity, NoteActivity } from './types';
import { Case, Contact, Referral } from '../../types/types';
import { channelTypes } from '../DomainConstants';
import { getTemplateStrings } from '../../hrmConfig';
import { ApiCaseSection } from '../../services/caseSectionService';

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

export const getNoteActivityText = (note: ApiCaseSection, formDefs: DefinitionVersion): string => {
  let { previewFields } = formDefs.layoutVersion.case.notes ?? {};
  if (!previewFields || !previewFields.length) {
    previewFields = formDefs.caseForms.NoteForm.length ? [formDefs.caseForms.NoteForm[0].name] : [];
  }
  return (
    previewFields
      .map(pf => note.sectionTypeSpecificData[pf])
      .filter(pv => pv)
      .join(', ') || '--'
  );
};

const getNoteActivities = (counsellorNotes: ApiCaseSection[], formDefs: DefinitionVersion): NoteActivity[] => {
  return (counsellorNotes || [])
    .map(n => {
      try {
        const { sectionId: id, createdAt: date, updatedAt, updatedBy, createdBy, sectionTypeSpecificData } = n;
        return {
          id,
          updatedAt,
          updatedBy,
          text: getNoteActivityText(n, formDefs),
          date,
          twilioWorkerId: createdBy,
          type: ActivityTypes.addNote,
          note: sectionTypeSpecificData,
        };
      } catch (err) {
        console.warn(`Error processing referral, excluding from data`, n, err);
        return null;
      }
    })
    .filter(na => na);
};

const referralActivities = (referrals: ApiCaseSection[]): Activity[] =>
  (referrals || [])
    .map(referral => {
      const { sectionId: id, createdAt, updatedAt, updatedBy, createdBy, sectionTypeSpecificData } = referral;
      const { referredTo, date } = sectionTypeSpecificData;
      try {
        return {
          id,
          date: date?.toString(),
          createdAt,
          twilioWorkerId: createdBy,
          updatedAt,
          updatedBy,
          type: ActivityTypes.addReferral,
          text: referredTo?.toString(),
          referral: sectionTypeSpecificData as Referral,
        };
      } catch (err) {
        console.warn(`Error processing referral, excluding from data`, referral, err);
        return null;
      }
    })
    .filter(ra => ra);

const getContactActivityText = (contact: Contact, strings: Record<string, string>): string => {
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

export const getActivitiesFromCase = (sourceCase: Case, formDefs: DefinitionVersion): Activity[] => {
  return [
    ...getNoteActivities(sourceCase?.sections?.note ?? [], formDefs),
    ...referralActivities(sourceCase?.sections?.referral ?? []),
  ];
};

export const getActivitiesFromContacts = (sourceContacts: Contact[]): Activity[] => {
  return connectedContactActivities(sourceContacts);
};

export const getActivityCount = (sourceCase: Case): number =>
  (sourceCase?.sections?.note?.length ?? 0) +
  (sourceCase?.sections?.referral?.length ?? 0) +
  (sourceCase?.connectedContacts?.length ?? 0);

/**
 * Sort activities from most recent to oldest.
 * @param activities Activities to sort
 */
export const sortActivities = <T extends Activity = Activity>(activities: T[]): T[] =>
  activities.sort((a, b) => b.date.localeCompare(a.date));
