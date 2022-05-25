export const ContactDetailsSections = {
  GENERAL_DETAILS: 'General details',
  CALLER_INFORMATION: 'Caller information',
  CHILD_INFORMATION: 'Child information',
  ISSUE_CATEGORIZATION: 'Issue categorization',
  CONTACT_SUMMARY: 'Contact summary',
  TRANSCRIPT: 'Transcript',
} as const;

export type ContactDetailsSectionsType = typeof ContactDetailsSections[keyof typeof ContactDetailsSections];
