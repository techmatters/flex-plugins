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
  for_each = toset(["Male", "Female", "Unknown"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_boy_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["m", "b", "men", "man", "boy"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Male"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_girl_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["women", "fe", "gal", "femme", "fem", "woman", "f", "g", "girl"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Female"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_unknown_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["idk", "i dont know", "i don't know", "dont want to say", "don't want to say", "prefer not", "prefer not to say", "no thank you", "no"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Unknown"
}
