import { RootState } from '..';
import { namespace } from '../storeNamespaces';
import { Case, Contact } from '../../types/types';

export const selectSavedContacts = (
  { [namespace]: { activeContacts } }: RootState,
  caseWithContacts: Case,
): Contact[] => {
  const connectedContactIds = new Set((caseWithContacts?.connectedContacts ?? []).map(cc => cc.id as string));
  return Object.values(activeContacts.existingContacts)
    .filter(contact => connectedContactIds.has(contact.savedContact.id))
    .map(ecs => ecs.savedContact);
};
