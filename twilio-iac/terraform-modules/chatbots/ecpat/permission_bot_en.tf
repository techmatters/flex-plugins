resource "twilio_autopilot_assistants_v1" "permission_bot_en" {
  unique_name   = "permissionBot_en"
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_redirect_page" {
  unique_name   = "redirect_page"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Please visit either of our facebook pages: https://www.facebook.com/ECPATPhilippines or https://www.facebook.com/eycaPhil"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_contact_reason" {
  unique_name   = "contact_reason"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
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
            "redirect" : {
              "method" : "POST",
              "uri" : "https://cinnamon-newt-9274.twil.io/reason"
            }
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
              "question" : "Welcome! To help us serve you better, please let us know about your concern: \n 1 - Reach out to eProtectKids \n 2 - Volunteer \n 3 - Donate \n 4 -Information and Resources",
              "name" : "service"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_permission" {
  unique_name   = "permission"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
  actions = jsonencode({
    "actions" : [
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://goodbye"
          },
          "name" : "collect_permission",
          "questions" : [
            {
              "type" : "Twilio.YES_NO",
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
              "question" : "For us to better assist you, this platform will collect personal information which will be used for case management purposes only in compliance to the Data Privacy Act of 2012 (RA 10173). Do you want to proceed? Please answer Yes or No.",
              "name" : "permission"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : "task://contact_reason"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "permission_bot_en_greeting_group" {
  for_each      = toset(["whatsup", "what do you do", "sup", "what can you do", "what'us up", "hey", "yo", "Hi", "hi there", "Hello.", "hi there.", "hi!", "good afternoon", "hello", "heya", "good morning"])
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.permission_bot_en_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_en_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you!"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "permission_bot_en_goodbye_group" {
  for_each      = toset(["that's all", "cancel", "stop talking", "see ya", "bye bye", "good bye", "go away", "no thanks", "no", "stop", "that would be all", "that would be all thanks", "goodbye", "goodnight", "that is all thank you", "no thanks", "that's all for today"])
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.permission_bot_en_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "permission_bot_en_Service" {
  unique_name   = "Service"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_en.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_en_values_Service_group" {
  for_each       = toset(["4", "3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_en.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_en_Service.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_en_synonymsOf_1_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_en_values_Service_group]
  for_each       = toset(["report", "help", "reach out", "eprotect", "eprotectkids"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_en.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_en_Service.sid
  synonym_of     = "1"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_en_synonymsOf_2_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_en_values_Service_group]
  for_each       = toset(["assist", "volunteer"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_en.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_en_Service.sid
  synonym_of     = "2"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_en_synonymsOf_3_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_en_values_Service_group]
  for_each       = toset(["donate"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_en.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_en_Service.sid
  synonym_of     = "3"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_en_synonymsOf_4_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_en_values_Service_group]
  for_each       = toset(["resources", "information and resources", "information", "info"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_en.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_en_Service.sid
  synonym_of     = "4"
  value          = each.key
  language       = "en-US"
}