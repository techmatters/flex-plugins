// Data callTypes. Preserving name to avoid big refactor
export const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
} as const;

export type DataCallTypesKeys = keyof typeof callTypes;
export type CallTypeKeys = DataCallTypesKeys | string; // This results in "strings" as it's a broader type. Leaving the DataCallTypesKeys in intentionally to emphasize them.
export type DataCallTypes = typeof callTypes[keyof typeof callTypes];
export type CallTypes = DataCallTypes | string; // This results in "strings" as it's a broader type. Leaving the DataCallTypes in intentionally to emphasize them.
