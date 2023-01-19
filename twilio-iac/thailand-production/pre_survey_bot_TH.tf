resource "twilio_autopilot_assistants_v1" "pre_survey_bot_TH" {
  unique_name   = "pre_survey_bot_TH"
  friendly_name = ""
  style_sheet = jsonencode({
    "style_sheet" : {
      "collect" : {
        "validate" : {
          "on_failure" : {
            "repeat_question" : false,
            "messages" : [
              {
                "say" : {
                  "speech" : "${local.strings_th["I didn't get that. What did you say?"]}?"
                }
              },
              {
                "say" : {
                  "speech" : "${local.strings_th["I didn't get that. What did you say?"]}"
                }
              },
              {
                "say" : {
                  "speech" : "${local.strings_th["I didn't get that. What did you say?"]}"
                }
              }
            ]
          },
          "on_success" : {
            "say" : {
              "speech" : ""
            }
          },
          "max_attempts" : 4
        }
      },
      "voice" : {
        "say_voice" : "Polly.Matthew"
      },
      "name" : ""
    }
  })
  defaults = jsonencode({
    "defaults" : {
      "assistant_initiation" : "task://greeting",
      "fallback" : "task://fallback",
      "collect" : {
        "validate_on_failure" : "task://collect_fallback"
      }
    }
  })
  log_queries = true
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_goodbye_msg" {
  unique_name   = "goodbye_msg"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "${local.strings_th["Goodbye"]}"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "${local.strings_th["OK, we'll transfer you to a counsellor."]}"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_get_is_emergency" {
  unique_name   = "get_is_emergency"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_is_emergency"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://flow-handler-7014.twil.io/flow-handler"
          },
          "name" : "get_is_emergency",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "${local.strings_th["I didn't understand that, you can write 1 or 2"]}"
                    },
                    {
                      "say" : "${local.strings_th["I didn't understand that, repeat is emergency"]}"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://counselor_handoff",
                  "num_attempts" : 3
                },
                "allowed_values" : {
                  "list" : [
                    "1",
                    "1.",
                    "2",
                    "2."
                  ]
                }
              },
              "question" : "${local.strings_th["We only serve under 18, write 1 for emergency or 2 to end chat"]}",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_get_about_self" {
  unique_name   = "get_about_self"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_about_self"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://flow-handler-7014.twil.io/flow-handler"
          },
          "name" : "get_about_self",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "${local.strings_th["I didn't understand that, you can write 1 or 2"]}"
                    },
                    {
                      "say" : "${local.strings_th["I didn't understand that, repeat calling about self"]}"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://counselor_handoff",
                  "num_attempts" : 3
                },
                "allowed_values" : {
                  "list" : [
                    "1",
                    "2",
                    "1.",
                    "2."
                  ]
                }
              },
              "question" : "${local.strings_th["Welcome, about self?"]}",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_get_age" {
  unique_name   = "get_age"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_age"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://flow-handler-7014.twil.io/flow-handler"
          },
          "name" : "get_age",
          "questions" : [
            {
              "type" : "Age",
              "question" : "${local.strings_th["How old are you?"]}",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_execute_initial_flow" {
  unique_name   = "execute_initial_flow"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "flowTree" : {
            "execute_initial_flow" : {
              "get_about_self" : {
                "1" : "counselor_handoff",
                "2" : {
                  "get_age" : {
                    ">=19" : {
                      "get_is_emergency" : {
                        "1" : "counselor_handoff",
                        "2" : "goodbye_msg"
                      }
                    },
                    "<19" : "counselor_handoff"
                  }
                }
              }
            }
          },
          "callerTask" : "execute_initial_flow"
        }
      },
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "https://flow-handler-7014.twil.io/flow-handler"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_TH_execute_initial_flow_group" {
  for_each      = toset(["${local.strings_th["hello"]}","${local.strings_th["hi"]}"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_TH_execute_initial_flow.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "${local.strings_th["Hello"]}"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "${local.strings_th["Goodbye"]}"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_TH_goodbye_group" {
  for_each      = toset(["see ya", "that's all", "goodbye", "good bye", "bye bye", "stop talking", "cancel", "goodnight", "stop", "go away", "no thanks", "that's all for today", "no", "that is all thank you", "no thanks", "that would be all thanks", "that would be all"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_TH_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "${local.strings_th["I didn't get that. What did you say?"]}"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_TH_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "${local.strings_th["I didn't get that. What did you say?"]}"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_TH_NumberReply" {
  unique_name   = "NumberReply"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_values_NumberReply_group" {
  for_each       = toset(["3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_NumberReply.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_synonymsOf_1_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_TH_values_NumberReply_group]
  for_each       = toset(["1!", "1."])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_NumberReply.sid
  synonym_of     = "1"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_synonymsOf_2_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_TH_values_NumberReply_group]
  for_each       = toset(["2!", "2."])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_NumberReply.sid
  synonym_of     = "2"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_synonymsOf_3_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_TH_values_NumberReply_group]
  for_each       = toset(["3!", "3."])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_NumberReply.sid
  synonym_of     = "3"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_TH_Age" {
  unique_name   = "Age"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_values_Age_group" {
  for_each       = toset([">=19", "<19"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_Age.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_synonymsOf_over18_Age_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_TH_values_Age_group]
  for_each       = toset(["100", "99", "98", "97", "96", "95", "94", "93", "92", "91", "90", "89", "88", "87", "86", "85", "84", "83", "82", "81", "80", "79", "78", "77", "76", "75", "74", "73", "72", "71", "70", "69", "68", "67", "66", "65", "64", "63", "62", "61", "60", "59", "58", "57", "56", "55", "54", "53", "52", "51", "50", "49", "48", "47", "46", "45", "44", "43", "42", "41", "40", "39", "38", "37", "36", "35", "34", "33", "32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_Age.sid
  synonym_of     = ">=19"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_TH_synonymsOf_under18_Age_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_TH_values_Age_group]
  for_each       = toset(["18","17", "16", "15", "14", "13", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "0", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_TH.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_TH_Age.sid
  synonym_of     = "<19"
  value          = each.key
  language       = "en-US"
}
