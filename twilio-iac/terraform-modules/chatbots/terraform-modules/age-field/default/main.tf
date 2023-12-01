terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

resource "twilio_autopilot_assistants_field_types_v1" "age" {
  unique_name = "Age"
  assistant_sid = var.bot_sid
}
resource "twilio_autopilot_assistants_field_types_field_values_v1" "number_age_group" {
  for_each = toset(["1", "2", "3", "4", "5", "6", "7", "8", "9",
    "10", "11", "12", "13", "14", "15", "16", "17", "18", "19"
  , "20", "21", "22", "23", "24", "25", "26", "27", "28", "29"
  , "10", "31", "32", "33", "34", "35", "36", "37", "38", "39"
  , "40", "41", "42", "43", "44", "45", "46", "47", "48", "49"
  , "50", "51", "52", "53", "54", "55", "56", "57", "58", "59"
  , "60", "61", "62", "63", "64", "65", "66", "67", "68", "69"
  , "70", "71", "72", "73", "74", "75", "76", "77", "78", "79"
  , "80", "81", "82", "83", "84", "85", "86", "87", "88", "89"
  , "90", "91", "92", "93", "94", "95", "96", "97", "98", "99"
  , "100", var.unknown_value])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.age.sid
  value = each.key
  language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "unknown_age_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.number_age_group] //Synonym creation fails if not created after what they alias
  for_each = var.unknown_synonyms
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.age.sid
  value = each.key
  language = "en-US"
  synonym_of = "Unknown"
}
