resource "twilio_autopilot_assistants_v1" "permission_bot_fil" {
  unique_name   = "permissionBot_fil"
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_redirect_page" {
  unique_name   = "redirect_page"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Mangyaring bisitahin ang alinman sa aming mga pahina sa facebook: https://www.facebook.com/ECPATPhilippines or https://www.facebook.com/eycaPhil"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_contact_reason" {
  unique_name   = "contact_reason"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_permission" {
  unique_name   = "permission"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
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
              "type" : "Permission",
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
              "question" : "Ang platform na ito ay mangongolekta ng ilang personal na impormasyon na gagamitin lamang para sa Case Management alinsunod sa Data Privacy Act of 2012 (RA 10173). Gusto mo bang magpatuloy? Mangyaring sagutin ng Oo o Hindi",
              "name" : "Permission"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : "task://contact_reason"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "permission_bot_fil_greeting_group" {
  for_each      = toset(["heya", "hey", "whatsup", "sup", "yo", "Hello.", "hello", "what can you do", "what'us up", "what do you do", "good afternoon", "Hi", "hi there.", "hi!", "hi there", "good morning"])
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.permission_bot_fil_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "permission_bot_fil_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Salamat!"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "permission_bot_fil_goodbye_group" {
  for_each      = toset(["bye bye", "see ya", "that's all", "no", "cancel", "stop", "stop talking", "good bye", "no thanks", "no thanks", "goodbye", "that would be all thanks", "goodnight", "that is all thank you", "that would be all", "that's all for today", "go away"])
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.permission_bot_fil_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "permission_bot_fil_Permission" {
  unique_name   = "Permission"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_values_Permission_group" {
  for_each       = toset(["No", "Yes"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Permission.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_synonymsOf_Yes_Permission_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_fil_values_Permission_group]
  for_each       = toset(["oo"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Permission.sid
  synonym_of     = "Yes"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_synonymsOf_No_Permission_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_fil_values_Permission_group]
  for_each       = toset(["hindi"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Permission.sid
  synonym_of     = "No"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "permission_bot_fil_Service" {
  unique_name   = "Service"
  assistant_sid = twilio_autopilot_assistants_v1.permission_bot_fil.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_values_Service_group" {
  for_each       = toset(["4", "3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Service.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_synonymsOf_1_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_fil_values_Service_group]
  for_each       = toset(["sa eprotect", "mag-report", "eprotectkids", "eprotect", "reach out", "help", "report"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Service.sid
  synonym_of     = "1"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_synonymsOf_2_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_fil_values_Service_group]
  for_each       = toset(["mag-volunteer", "volunteer", "assist"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Service.sid
  synonym_of     = "2"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_synonymsOf_3_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_fil_values_Service_group]
  for_each       = toset(["donate"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Service.sid
  synonym_of     = "3"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "permission_bot_fil_synonymsOf_4_Service_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.permission_bot_fil_values_Service_group]
  for_each       = toset(["iba pang impormasyon", "resources", "info"])
  assistant_sid  = twilio_autopilot_assistants_v1.permission_bot_fil.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.permission_bot_fil_Service.sid
  synonym_of     = "4"
  value          = each.key
  language       = "en-US"
}