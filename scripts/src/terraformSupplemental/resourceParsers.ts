import twilio from 'twilio';

export enum ResourceType {
  Assistant = 'twilio_autopilot_assistants_v1',
  AssistantFieldType = 'twilio_autopilot_assistants_field_types_v1',
  AssistantFieldValue = 'twilio_autopilot_assistants_field_types_field_values_v1',
}

export type Ids = { sid: string; terraformId: string; knownSidKey?: string | number };

export type FieldValueParser = {
  pattern: RegExp;
  findResourceSids: (
    client: twilio.Twilio,
    knownSids: Record<string, string>,
    captures: Record<string, string>,
  ) => Promise<Ids[]>;
};

export function lookupKnownResourseSid(
  knownResourceSids: Record<string, string>,
  fqResourceName: string,
) {
  const sid = knownResourceSids[fqResourceName];
  if (!sid) {
    throw new Error(
      `${fqResourceName} not found amongst known resource sids, it is required to look up a dependent SID. Either you need to change the order you are parsing your types in, or the required resource is not defined in the input HCL file.`,
    );
  }
  return sid;
}
