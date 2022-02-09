// Can't get regex literals to work in TS, and complex regex's are a PITA without them, so defining them in JS

export const fieldTypeValue =
  /resource\s+"twilio_autopilot_assistants_field_types_field_values_v1"\s+"(?<resourceName>.*)"\s+\{[^}]+for_each\s+=\s+toset\((?<fieldValues>\[.+\])\)[^}]+assistant_sid\s+=\s+(?<assistantResource>\S+)[^}]+field_type_sid\s+=\s+(?<fieldTypeResource>\S+)[^}]+}/gm;

export const fieldType =
  /resource\s+"twilio_autopilot_assistants_field_types_v1"\s+"(?<resourceName>.*)"\s+\{[^}]+unique_name\s+=\s+"(?<uniqueName>\S+)"[^}]+assistant_sid\s+=\s+(?<assistantResource>\S+)[^}]+}/gm;

export const assistant =
  /resource\s+"twilio_autopilot_assistants_v1"\s+"(?<resourceName>.*)"\s+\{[^}]+unique_name\s+=\s+"(?<uniqueName>\S+)"[^}]+}/gm;
