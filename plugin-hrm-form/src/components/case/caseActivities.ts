import { Activity, ConnectedCaseActivity, NoteActivity } from '../../states/case/types';
import { Case, NoteEntry, ReferralEntry } from '../../types/types';
import { channelTypes } from '../../states/DomainConstants';
import { getDefinitionVersions } from '../../HrmFormPlugin';

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

/**
 * Returns true if the activity provided is a connected case activity (included in channelsAndDefault const object)
 * @param activity Timeline Activity
 */
export const isNoteActivity = (activity): activity is ConnectedCaseActivity => activity.type === 'note';

const noteActivities = (counsellorNotes: NoteEntry[], previewFields: string[]): NoteActivity[] =>
  (counsellorNotes || [])
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

const connectedContactActivities = (caseContacts): ConnectedCaseActivity[] =>
  (caseContacts || [])
    .map(cc => {
      try {
        const type = ActivityTypes.connectContact[cc.channel];
        const channel = type === ActivityTypes.connectContact.default ? cc.rawJson.contactlessTask.channel : type;
        return {
          contactId: cc.id.toString(),
          date: cc.timeOfContact,
          createdAt: cc.createdAt,
          type,
          text: cc.rawJson.caseInformation.callSummary,
          twilioWorkerId: cc.twilioWorkerId,
          channel,
          callType: cc.rawJson.callType,
        };
      } catch (err) {
        console.warn(`Error processing connected contact, excluding from data`, cc, err);
        return null;
      }
    })
    .filter(cca => cca);

export const getActivitiesFromCase = (sourceCase: Case): Activity[] => {
  const { definitionVersions } = getDefinitionVersions();
  const formDefs = definitionVersions[sourceCase.info.definitionVersion];
  let { previewFields } = formDefs.layoutVersion.case.notes ?? {};
  if (!previewFields || !previewFields.length) {
    previewFields = formDefs.caseForms.NoteForm.length ? [formDefs.caseForms.NoteForm[0].name] : [];
  }
  return [
    ...noteActivities(sourceCase.info.counsellorNotes ?? [], previewFields),
    ...referralActivities(sourceCase.info.referrals ?? []),
  ];
};

export const getActivitiesFromContacts = (sourceContacts: any[]): Activity[] => {
  return connectedContactActivities(sourceContacts);
};

/**
 * Sort activities from most recent to oldest.
 * @param activities Activities to sort
 */
export const sortActivities = (activities: Activity[]): Activity[] =>
  activities.sort((a, b) => b.date.localeCompare(a.date));
