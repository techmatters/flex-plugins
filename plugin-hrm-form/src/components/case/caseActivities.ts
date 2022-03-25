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
        const { createdAt: date, note: text, ...toCopy } = n;
        return {
          ...toCopy,
          date,
          type: ActivityTypes.addNote,
          text,
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
    .map((referral, originalIndex) => {
      const { comments, referredTo: text, ...toCopy } = referral;
      try {
        return {
          ...toCopy,
          type: ActivityTypes.addReferral,
          text,
          referral,
          originalIndex,
        };
      } catch (err) {
        console.warn(`Error processing referral, excluding from data`, referral, err);
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
