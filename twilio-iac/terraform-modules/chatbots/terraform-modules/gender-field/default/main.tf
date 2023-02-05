terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

resource "twilio_autopilot_assistants_field_types_v1" "gender" {
  unique_name = "Gender"
  assistant_sid = var.bot_sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_group" {
  for_each = toset(["Boy", "Girl", "Unknown", "Non-Binary"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_boy_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["male", "man", "M", "guy", "dude", "males", "B"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Boy"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_girl_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["female", "woman", "F", "W", "lady", "females", "G"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Girl"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_unknown_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["prefer not to answer", "X", "none of your business", "prefer not", "prefer not to"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Unknown"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_nonbinary_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["NB", "agender", "nonbinary", "non binary"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Non-Binary"
}