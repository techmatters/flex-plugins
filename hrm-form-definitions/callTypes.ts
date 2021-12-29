export const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
  silent: 'Silent',
  blank: 'Blank',
  joke: 'Joke',
  hangup: 'Hang up',
  wrongnumber: 'Wrong Number',
  abusive: 'Abusive',
  test: 'test',
} as const;

export type CallTypeKeys = keyof typeof callTypes;
export type CallTypes = typeof callTypes[keyof typeof callTypes];
export type DataCallTypes = typeof callTypes['child' | 'caller'];