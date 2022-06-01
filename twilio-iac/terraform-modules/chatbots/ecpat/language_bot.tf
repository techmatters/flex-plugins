resource "twilio_autopilot_assistants_v1" "language_bot" {
  unique_name   = "LanguageBot"
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

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_language_selected" {
  unique_name   = "language_selected"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_survey_start" {
  unique_name   = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
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
            "redirect" : "task://language_selected"
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
              "question" : "What language do you speak? Please select from the below supported languages: \n 1. English \n 2. Filipino",
              "name" : "language"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
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

resource "twilio_autopilot_assistants_tasks_samples_v1" "language_bot_greeting_group" {
  for_each      = toset(["good morning", "hey", "whatsup", "hi there.", "what can you do", "yo", "what do you do", "Hello.", "sup", "what'us up", "hi!", "Hi", "heya", "hi there", "good afternoon", "hello"])
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.language_bot_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you! Please reach out again if you need anything. Goodbye."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "language_bot_goodbye_group" {
  for_each      = toset(["good bye", "that's all", "stop talking", "stop", "goodnight", "bye bye", "goodbye", "cancel", "go away", "that's all for today", "no thanks", "see ya", "that would be all", "that would be all thanks", "no", "no thanks", "that is all thank you"])
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.language_bot_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "language_bot_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
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

resource "twilio_autopilot_assistants_field_types_v1" "language_bot_language" {
  unique_name   = "language"
  assistant_sid = twilio_autopilot_assistants_v1.language_bot.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "language_bot_values_language_group" {
  for_each       = toset(["Filipino", "en-US"])
  assistant_sid  = twilio_autopilot_assistants_v1.language_bot.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.language_bot_language.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "language_bot_synonymsOf_Filipino_language_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.language_bot_values_language_group]
  for_each       = toset(["2", "f"])
  assistant_sid  = twilio_autopilot_assistants_v1.language_bot.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.language_bot_language.sid
  synonym_of     = "Filipino"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "language_bot_synonymsOf_en-US_language_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.language_bot_values_language_group]
  for_each       = toset(["1", "e", "eng", "English"])
  assistant_sid  = twilio_autopilot_assistants_v1.language_bot.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.language_bot_language.sid
  synonym_of     = "en-US"
  value          = each.key
  language       = "en-US"
}