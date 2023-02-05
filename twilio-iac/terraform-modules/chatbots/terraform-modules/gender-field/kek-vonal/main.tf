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
  for_each = toset(["Nem derült ki", "Fiú", "Nem bináris", "Lány"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_boy_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["fui", "fi", "boy", "f"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Fiú"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_girl_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["lny", "girl", "lan", "l"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Lány"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_unknown_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["x"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Nem derült ki"
}


resource "twilio_autopilot_assistants_field_types_field_values_v1" "gender_nonbinary_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.gender_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["nb", "nembinaris", "nem"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.gender.sid
  value = each.key
  language = "en-US"
  synonym_of = "Nem bináris"
}