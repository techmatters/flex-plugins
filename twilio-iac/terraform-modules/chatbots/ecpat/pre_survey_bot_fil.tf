resource "twilio_autopilot_assistants_v1" "pre_survey_bot_fil" {
  unique_name   = "preSurvey_fil"
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
                  "speech" : "I didn't get that. What did you say?"
                }
              },
              {
                "say" : {
                  "speech" : "I still didn't catch that. Please repeat."
                }
              },
              {
                "say" : {
                  "speech" : "Let's try one last time. Say it again please."
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

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "sendToAgent" : true,
          "at" : "counselor_handoff"
        }
      },
      {
        "say" : "Ita-transfer ka namin sa isang helpline responder. Maaring pakihintay"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_survey" {
  unique_name   = "survey"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey"
        }
      },
      {
        "say" : "Salamat. I-type ang 'X' kung hindi mo nais sagutin ang anumang tanong"
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://redirect_function"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "csam",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, hindi ko iyan maintindihan."
                    },
                    {
                      "say" : "Sorry, hindi ko pa rin iyan nakukuha."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Nais mo bang mag report ng Child Sexual Abuse Material (CSAM) o insidente ng Sexual Exploitation? Oo o Hindi",
              "name" : "csam"
            },
            {
              "type" : "Age",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, hindi ko iyan maintindihan."
                    },
                    {
                      "say" : "Sorry, hindi ko pa rin iyan nakukuha."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Ilan taon ka na?",
              "name" : "age"
            },
            {
              "type" : "Gender",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, hindi ko iyan maintindihan."
                    },
                    {
                      "say" : "Sorry, hindi ko pa rin iyan nakukuha."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Gender: Babae,Lalaki, LGBTQ+",
              "name" : "gender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_survey_start" {
  unique_name   = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey_start"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://survey"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "about_self",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, hindi ko iyan maintindihan."
                    },
                    {
                      "say" : "Sorry, hindi ko pa rin iyan nakukuha."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Ikaw ba ay nagrereport tungkol sa iyong sarili? Oo o Hindi",
              "name" : "about_self"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "${var.serverless_url}/autopilotRedirect"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "I'm sorry didn't quite get that. Please say that again."
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you! Please reach out again if you need anything. Goodbye."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_fil_goodbye_group" {
  for_each      = toset(["that is all thank you", "that's all", "see ya", "good bye", "bye bye", "goodnight", "stop", "cancel", "goodbye", "go away", "that would be all thanks", "no", "stop talking", "that's all for today", "no thanks", "no thanks", "that would be all"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_fil_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Looks like I'm having trouble. Apologies for that. Let's start again, how can I help you today?"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_fil_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "greeting"
        }
      },
      {
        "redirect" : "task://survey_start"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_fil_greeting_group" {
  for_each      = toset(["yo", "what do you do", "whatsup", "what can you do", "hi!", "sup", "hey", "what'us up", "Hi", "hi there.", "hi there", "Hello.", "hello", "heya", "good afternoon", "good morning"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_fil_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_fil_about_self" {
  unique_name   = "about_self"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_values_about_self_group" {
  for_each       = toset(["No", "Yes"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_about_self.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Yes_about_self_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_about_self_group]
  for_each       = toset(["oo"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_about_self.sid
  synonym_of     = "Yes"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_No_about_self_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_about_self_group]
  for_each       = toset(["hindi"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_about_self.sid
  synonym_of     = "No"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_fil_csam" {
  unique_name   = "csam"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_values_csam_group" {
  for_each       = toset(["No", "Yes"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_csam.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Yes_csam_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_csam_group]
  for_each       = toset(["oo"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_csam.sid
  synonym_of     = "Yes"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_No_csam_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_csam_group]
  for_each       = toset(["hindi"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_csam.sid
  synonym_of     = "No"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_fil_Gender" {
  unique_name   = "Gender"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_values_Gender_group" {
  for_each       = toset(["Boy", "Girl", "Non-Binary", "Unknown"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Gender.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Unknown_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_Gender_group]
  for_each       = toset(["prefer not to answer", "x"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Gender.sid
  synonym_of     = "Unknown"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Non-Binary_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_Gender_group]
  for_each       = toset(["LGBTQ+"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Gender.sid
  synonym_of     = "Non-Binary"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Boy_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_Gender_group]
  for_each       = toset(["baba", "Babae"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Gender.sid
  synonym_of     = "Boy"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Girl_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_Gender_group]
  for_each       = toset(["Lalaki"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Gender.sid
  synonym_of     = "Girl"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_fil_Age" {
  unique_name   = "Age"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_values_Age_group" {
  for_each       = toset(["Unknown", "62", "61", "60", "59", "58", "57", "56", "55", "54", "53", "52", "51", "50", "49", "48", "47", "46", "45", "44", "43", "42", "41", "40", "39", "38", "37", "36", "35", "34", "33", "32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14", "13", "12", "11", "10", "09", "8", "7", "6", "5", "4", "3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Age.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_fil_synonymsOf_Unknown_Age_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_fil_values_Age_group]
  for_each       = toset(["prefer not to answer", "x"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_fil_Age.sid
  synonym_of     = "Unknown"
  value          = each.key
  language       = "en-US"
}