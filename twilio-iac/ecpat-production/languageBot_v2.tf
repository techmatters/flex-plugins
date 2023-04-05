resource "twilio_autopilot_assistants_v1" "languageBot_v2" {
  unique_name   = "LanguageBot_v2"
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

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_skip_flow" {
  unique_name   = "skip_flow"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "skipping flow"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "languageBot_v2_skip_flow_group" {
  for_each      = toset(["skip flow"])
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.languageBot_v2_skip_flow.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_contact_reason_fil" {
  unique_name   = "contact_reason_fil"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "choice" : "contact_reason"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://goodbye"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Service",
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
              "question" : "Magandang Araw! Para matulungan ka namin ng mas mabuti, piliin sa mga sumusunod ang inyong concern o pangangailangan: 1. Mag-report sa eProtectkids 2. Mag-volunteer 3. Magbigay ng Donasyon 4. Iba pang impormasyon",
              "name" : "service"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_contact_reason" {
  unique_name   = "contact_reason"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "choice" : "contact_reason"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://goodbye"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Service",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, I didn't get that. Please enter a number."
                    },
                    {
                      "say" : "Sorry, I still didn't get that."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "To help us serve you better, please let us know about your concern: \n 1 - Reach out to eProtectKids \n 2 - Volunteer \n 3 - Donate \n 4 - Information and Resources",
              "name" : "service"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "${module.serverless.serverless_environment_production_url}/autopilotRedirect"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_language_selected" {
  unique_name   = "language_selected"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you/Salamat"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_survey_start" {
  unique_name   = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "choice" : "survey_start"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : {
              "method" : "POST",
              "uri" : "https://black-numbat-7172.twil.io/languagesplit"
            }
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "language",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Sorry, I didn't understand that."
                    },
                    {
                      "say" : "I still didn't get that."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Respond 1 for English \n Sagutin ang 2 para sa Filipino",
              "name" : "languages"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "languageBot_v2_survey_start_group" {
  for_each      = toset(["filipino", "english", "en", "2", "1"])
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.languageBot_v2_survey_start.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Welcome to ECPAT Philippines!"
      },
      {
        "redirect" : "task://survey_start"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "languageBot_v2_greeting_group" {
  for_each      = toset(["good morning", "hey", "whatsup", "hi there.", "what can you do", "yo", "what do you do", "Hello.", "sup", "what'us up", "hi!", "Hi", "heya", "hi there", "good afternoon", "hello"])
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.languageBot_v2_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you/Salamat"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "languageBot_v2_goodbye_group" {
  for_each      = toset(["good bye", "that's all", "stop talking", "stop", "goodnight", "bye bye", "goodbye", "cancel", "go away", "that's all for today", "no thanks", "see ya", "that would be all", "that would be all thanks", "no", "no thanks", "that is all thank you"])
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.languageBot_v2_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "languageBot_v2_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
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

resource "twilio_autopilot_assistants_field_types_v1" "languageBot_v2_Service" {
  unique_name   = "Service"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_values_Service_group" {
  for_each       = toset(["2", "4", "3", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_Service.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_synonymsOf_1_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.languageBot_v2_values_Service_group]
  for_each       = toset(["reach out", "help", "eprotect", "eprotectkids", "report", "mag-report", "sa eprotect"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_Service.sid
  synonym_of     = "1"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_synonymsOf_2_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.languageBot_v2_values_Service_group]
  for_each       = toset(["volunteer", "mag-volunteer"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_Service.sid
  synonym_of     = "2"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_synonymsOf_3_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.languageBot_v2_values_Service_group]
  for_each       = toset(["donate"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_Service.sid
  synonym_of     = "3"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_synonymsOf_4_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.languageBot_v2_values_Service_group]
  for_each       = toset(["info", "resources", "impormasyon", "iba pang impormasyon"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_Service.sid
  synonym_of     = "4"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "languageBot_v2_language" {
  unique_name   = "language"
  assistant_sid = twilio_autopilot_assistants_v1.languageBot_v2.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_values_language_group" {
  for_each       = toset(["Filipino", "en-US"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_language.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_synonymsOf_en-US_language_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.languageBot_v2_values_language_group]
  for_each       = toset(["either", "any", "1", "e", "eng", "English"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_language.sid
  synonym_of     = "en-US"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "languageBot_v2_synonymsOf_Filipino_language_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.languageBot_v2_values_language_group]
  for_each       = toset(["2", "f"])
  assistant_sid  = twilio_autopilot_assistants_v1.languageBot_v2.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.languageBot_v2_language.sid
  synonym_of     = "Filipino"
  value          = each.key
  language       = "en-US"
}
