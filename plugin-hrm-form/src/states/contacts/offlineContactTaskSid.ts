import { getHrmConfig } from '../../hrmConfig';

// eslint-disable-next-line prettier/prettier
const getOfflineContactTaskSid = (): `offline-contact-task-${string}` => `offline-contact-task-${getHrmConfig().workerSid}`;

export default getOfflineContactTaskSid;