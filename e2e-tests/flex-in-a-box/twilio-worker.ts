import context from './global-context';
import { subHours } from 'date-fns';
import { initialiseLiveQueryData } from './twilsock-live-query';

const hourAgo = subHours(new Date(), 1);

export const loggedInWorker = () => {
  return {
    worker_sid: context.LOGGED_IN_WORKER_SID,
    worker_activity_sid: 'WA_OFFLINE',
    activity_name: 'Offline',
    date_activity_changed: hourAgo.toISOString(),
    friendly_name: 'loggedin@worker.org',
    date_updated: hourAgo.toISOString(),
    workspace_sid: context.WORKSPACE_SID,
    attributes: {
      counselorLanguage: '',
      routing: { skills: ['chat'], levels: {} },
      helpline: '',
      full_name: 'Fake Logged In Worker',
      image_url: '',
      roles: ['admin', 'wfo.full_access'],
      contact_uri: 'client:loggedin_40worker_2Eorg',
      waitingOfflineContact: false,
      maxMessageCapacity: '3',
      email: 'loggedin@worker.org',
      twilio_contact_identity: 'loggedin_40worker_2Eorg',
    },
  };
};

export const setLoggedInWorkerLiveQuery = () =>
  initialiseLiveQueryData(
    '/v3/Insights/tr-worker/Items',
    `data.worker_sid == "${context.LOGGED_IN_WORKER_SID}"`,
    { [context.LOGGED_IN_WORKER_SID]: loggedInWorker() },
  );
