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

import { Activity, ConnectedCaseActivity, NoteActivity } from './types';
import { Case, Contact, NoteEntry, ReferralEntry } from '../../types/types';
import { channelTypes } from '../DomainConstants';
import { getTemplateStrings } from '../../hrmConfig';

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
 * Returns true if the activity provided is a connected case activity (included in channelsAndDefault const object)
 * @param activity Timeline Activity
 */
export const isConnectedCaseActivity = (activity): activity is ConnectedCaseActivity =>
  Boolean(ActivityTypes.connectContact[activity.type]);

export const getNoteActivities = (counsellorNotes: NoteEntry[], formDefs: DefinitionVersion): NoteActivity[] => {
  let { previewFields } = formDefs.layoutVersion.case.notes ?? {};
  if (!previewFields || !previewFields.length) {
    previewFields = formDefs.caseForms.NoteForm.length ? [formDefs.caseForms.NoteForm[0].name] : [];
  }
  return (counsellorNotes || [])
    .map(n => {
      try {
        const { id, createdAt: date, updatedAt, updatedBy, twilioWorkerId, ...toCopy } = n;
        const text =
          previewFields
            .map(pf => toCopy[pf])
            .filter(pv => pv)
            .join(', ') || '--';
        return {
          id,
          updatedAt,
          updatedBy,
          text,
          date,
          twilioWorkerId,
          type: ActivityTypes.addNote,
          note: toCopy,
        };
      } catch (err) {
        console.warn(`Error processing referral, excluding from data`, n, err);
        return null;
      }
    })
    .filter(na => na);
};

const referralActivities = (referrals: ReferralEntry[]): Activity[] =>
  (referrals || [])
    .map(referral => {
      const { id, createdAt, date, updatedAt, updatedBy, twilioWorkerId, ...toCopy } = referral;
      const { referredTo: text } = referral;
      try {
        return {
          id,
          date,
          createdAt,
          twilioWorkerId,
          updatedAt,
          updatedBy,
          type: ActivityTypes.addReferral,
          text,
          referral: { date, ...toCopy },
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

const connectedContactActivities = (caseContacts: Contact[]): ConnectedCaseActivity[] => {
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
    ...getNoteActivities(sourceCase.info.counsellorNotes ?? [], formDefs),
    ...referralActivities(sourceCase.info.referrals ?? []),
  ];
};

export const getActivitiesFromContacts = (sourceContacts: Contact[]): Activity[] => {
  return connectedContactActivities(sourceContacts);
};

export const getActivityCount = (sourceCase: Case): number =>
  (sourceCase?.info?.counsellorNotes?.length ?? 0) +
  (sourceCase?.info?.referrals?.length ?? 0) +
  (sourceCase?.connectedContacts?.length ?? 0);

/**
 * Sort activities from most recent to oldest.
 * @param activities Activities to sort
 */
export const sortActivities = <T extends Activity = Activity>(activities: T[]): T[] =>
  activities.sort((a, b) => b.date.localeCompare(a.date));
