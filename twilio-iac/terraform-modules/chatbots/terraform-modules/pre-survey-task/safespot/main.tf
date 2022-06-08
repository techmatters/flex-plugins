terraform {
  required_providers {
    twilio = {
      source  = "twilio/twilio"
      version = "0.17.0"
    }
  }
}

resource "twilio_autopilot_assistants_tasks_v1" "survey" {
  unique_name = "survey"
  assistant_sid = var.bot_sid
  actions = jsonencode({
    "actions": [
      {
        "remember": {
          "at": "survey"
        }
      },
      {
        "say": "Thank you. You can say 'prefer not to answer' (or type X) to any question."
      },
      {
        "collect": {
          "name": "collect_survey",
          "questions": [
            {
              "question": "How old are you?",
              "name": "age",
              "type": "Age",
              "validate": {
                "on_failure": {
                  "messages": [
                    {
                      "say": "Sorry, I didn't understand that. Please respond with a number."
                    },
                    {
                      "say": "Sorry, I still didn't get that."
                    }
                  ],
                  "repeat_question": true
                },
                "max_attempts": {
                  "redirect": "task://redirect_function",
                  "num_attempts": 2
                }
              }
            },
            {
              "question": "What is your gender?",
              "name": "gender",
              "type": "Gender",
              "validate": {
                "on_failure": {
                  "messages": [
                    {
                      "say": "Sorry, I didn't understand that. Please try again."
                    },
                    {
                      "say": "Sorry, I still didn't get that."
                    }
                  ],
                  "repeat_question": true
                },
                "max_attempts": {
                  "redirect": "task://redirect_function",
                  "num_attempts": 2
                }
              }
            },
            {
              "question": "What parish are you located in?",
              "name": "parish",
              "type": "Parish",
              "validate": {
                "on_failure": {
                  "messages": [
                    {
                      "say": "Sorry, I didn't understand that. Please try again."
                    },
                    {
                      "say": "Sorry, I still didn't get that."
                    }
                  ],
                  "repeat_question": true
                },
                "max_attempts": {
                  "redirect": "task://redirect_function",
                  "num_attempts": 2
                }
              }
            }
          ],
          "on_complete": {
            "redirect": "task://redirect_function"
          }
        }
      }
    ]
  })
}


resource "twilio_autopilot_assistants_field_types_v1" "parish" {
  unique_name = "Parish"
  assistant_sid = var.bot_sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_group" {
  for_each = toset(["Unknown", "Portland", "St. Mary", "St. Ann", "Trelawny", "St. James", "Hanover", "Westmoreland", "St. Elizabeth", "Manchester", "Clarendon", "St. Catherine", "St. Thomas", "St. Andrew", "Kingston"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_unknown_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["no", "x"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "Unknown"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_stmary_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s mary", "stm ary", "st mary", "stmary"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. Mary"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_stann_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s ann", "sta nn", "st ann", "stann"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. Ann"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_stjames_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s james", "stj ames", "st james", "stjames"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. James"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_stelizabeth_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s elizabeth", "se lizabeth", "st elizabeth", "stelizabeth"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. Elizabeth"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_stcatherine_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s catherine", "sc atherine", "st catherine", "stcatherine"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. Catherine"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_stthomas_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s thomas", "st homas", "st thomas", "stthomas", "thomas"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. Thomas"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "parish_standrew_synonym_group" {
  depends_on = [twilio_autopilot_assistants_field_types_field_values_v1.parish_group] //Synonym creation fails if not created after what they alias
  for_each = toset(["s andrew", "sa ndrew", "st andrew", "standrew", "andrew"])
  assistant_sid = var.bot_sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.parish.sid
  value = each.key
  language = "en-US"
  synonym_of = "St. Andrew"
}
