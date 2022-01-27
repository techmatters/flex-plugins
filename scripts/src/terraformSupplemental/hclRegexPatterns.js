// Can't get regex literals to work in TS, and complex regex's are a PITA without them, so defining them in JS

export const fieldTypeValue =
  /resource\s+"twilio_autopilot_assistants_field_types_field_values_v1"\s+"(?<resourceName>.*)"\s+\{[^}]+for_each\s+=\s+toset\((?<fieldValues>\[.+\])\)[^}]+assistant_sid\s+=\s+(?<assistandSid>\S+)[^}]+field_type_sid\s+=\s+(?<fieldTypeSid>\S+)[^}]+}/gm;

export const fieldType =
  /resource\s+"twilio_autopilot_assistants_field_types_v1"\s+"(?<resourceName>.*)"\s+\{[^}]+assistant_sid\s+=\s+(?<assistandSid>\S+)[^}]+}/gm;
