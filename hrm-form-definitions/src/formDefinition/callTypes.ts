// Data callTypes. Preserving name to avoid big refactor
export const callTypes = {
  child: 'Child calling about self',
  caller: 'Someone calling about a child',
} as const;

export type DataCallTypes = typeof callTypes['child' | 'caller'];
export type CallTypeKeys = DataCallTypes | string; // This results in "strings" as it's a broader type. Leaving the DataCallTypes in intentionally to emphasize them.
export type CallTypes = string;
