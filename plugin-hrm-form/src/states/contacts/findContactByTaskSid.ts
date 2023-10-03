import { contactFormsBase, namespace, RootState } from '..';
import { ContactState } from './existingContacts';

const findContactByTaskSid = (state: RootState, taskSid: string): ContactState =>
  Object.values(state[namespace][contactFormsBase].existingContacts).find(cs => cs.savedContact?.taskId === taskSid);

export default findContactByTaskSid;
