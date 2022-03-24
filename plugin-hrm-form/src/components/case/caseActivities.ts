import { Activity, ConnectedCaseActivity } from '../../states/case/types';
import { Case, NoteEntry, ReferralEntry } from '../../types/types';
import { channelTypes } from '../../states/DomainConstants';

const ActivityTypes = {
  createCase: 'create',
  addNote: 'note',
  addReferral: 'referral',
  connectContact: {
    ...channelTypes,
    default: 'default',
  },
  unknown: 'unknown',
};

/**
 * Returns true if the activity provided is a connected case activity (included in channelsAndDefault const object)
 * @param activity Timeline Activity
 */
export const isConnectedCaseActivity = (activity): activity is ConnectedCaseActivity =>
  Boolean(ActivityTypes.connectContact[activity.type]);

const noteActivities = (counsellorNotes: NoteEntry[]): Activity[] =>
  (counsellorNotes || [])
    .map((n, originalIndex) => {
      try {
        return {
          date: n.createdAt,
          type: ActivityTypes.addNote,
          text: n.note,
          twilioWorkerId: n.twilioWorkerId,
          originalIndex,
        };
      } catch (err) {
        console.warn(`Error processing referral, excluding from data`, n, err);
        return null;
      }
    })
    .filter(na => na);

const referralActivities = (referrals: ReferralEntry[]): Activity[] =>
  (referrals || [])
    .map((r, originalIndex) => {
      try {
        return {
          date: r.date as string,
          createdAt: r.createdAt as string,
          type: ActivityTypes.addReferral,
          text: r.referredTo as string,
          twilioWorkerId: r.twilioWorkerId as string,
          referral: r,
          originalIndex,
        };
      } catch (err) {
        console.warn(`Error processing referral, excluding from data`, r, err);
        return null;
      }
    })
    .filter(ra => ra);

const connectedContactActivities = (caseContacts): Activity[] =>
  (caseContacts || [])
    .map((cc, originalIndex) => {
      try {
        const type = ActivityTypes.connectContact[cc.channel];
        const channel = type === ActivityTypes.connectContact.default ? cc.rawJson.contactlessTask.channel : type;
        return {
          contactId: cc.id,
          date: cc.timeOfContact,
          createdAt: cc.createdAt,
          type,
          text: cc.rawJson.caseInformation.callSummary,
          twilioWorkerId: cc.twilioWorkerId,
          channel,
          originalIndex,
        };
      } catch (err) {
        console.warn(`Error processing connected contact, excluding from data`, cc, err);
        return null;
      }
    })
    .filter(cca => cca);

export const getActivitiesFromCase = (sourceCase: Case): Activity[] => {
  return [
    ...noteActivities(sourceCase.info.counsellorNotes ?? []),
    ...referralActivities(sourceCase.info.referrals ?? []),
    ...connectedContactActivities(sourceCase.connectedContacts ?? []),
  ];
};
/**
 * Sort activities from most recent to oldest.
 * @param activities Activities to sort
 */
export const sortActivities = (activities: Activity[]): Activity[] =>
  activities.sort((a, b) => b.date.localeCompare(a.date));
