resource "twilio_autopilot_assistants_v1" "chatbot_ru_HU" {
  unique_name   = "demo_chatbot_RU-hu"
  friendly_name = "A bot that collects a pre-survey"
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "greeting"
        }
      },
      {
        "say" : "Привет, это Kék Vonal! Пожалуйста, ответь на пару вопросов, чтобы мы могли тебе помочь"
      },
      {
        "redirect" : "task://survey_start"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_ru_HU_greeting_group" {
  for_each      = toset(["Hi", "sup", "good afternoon", "what can you do", "hi!", "yo", "what'us up", "hi there.", "hello", "hey", "whatsup", "good morning", "hi there", "heya", "Hello.", "what do you do"])
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.chatbot_ru_HU_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Thank you! Please reach out again if you need anything. Goodbye."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "chatbot_ru_HU_goodbye_group" {
  for_each      = toset(["that would be all thanks", "that is all thank you", "that would be all", "goodnight", "that's all for today", "stop talking", "cancel", "bye bye", "good bye", "see ya", "that's all", "no", "no thanks", "go away", "stop", "goodbye"])
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.chatbot_ru_HU_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "I'm sorry didn't quite get that. Please try that again."
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "sendToAgent" : true,
          "at" : "counselor_handoff"
        }
      },
      {
        "say" : "Свяжем тебя с нашим консультантом, с которым ты сможешь поговорить."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_gender_why" {
  unique_name   = "gender_why"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "gender_why"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://redirect_function"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Gender",
              "validate" : {
                "on_failure" : {
                  "messages" : [
                    {
                      "say" : "Got it."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 1
                },
                "allowed_values" : {
                  "list" : [
                    "Boy",
                    "Girl",
                    "Non-binary"
                  ]
                }
              },
              "question" : "We ask for gender--whether you identify as a boy, girl, or neither--to help understand who is using our helpline. If you're uncomfortable answering, just say 'prefer not to answer.'",
              "name" : "gender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_survey_start" {
  unique_name   = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
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
              "type" : "Self",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Мне жаль, я этого не понимаю."
                    },
                    {
                      "say" : "Мне жаль, я все еще не понимаю"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Тебе нужна помощь для себя или для кого-то другого? Пожалуйста, ответь «Да» или «Нет».",
              "name" : "about_self"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "chatbot_ru_HU_survey" {
  unique_name   = "survey"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey"
        }
      },
      {
        "say" : "Спасибо. Если не хочешь отвечать на этот вопрос, напиши «Дальше»."
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://redirect_function"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Age",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Извини, я этого не понимаю. Пожалуйста, набери цифру."
                    },
                    {
                      "say" : "Мне жаль, я все еще не понимаю"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "Сколько тебе лет? Пожалуйста, дай ответ цифрой.",
              "name" : "age"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ru_HU_Self" {
  unique_name   = "Self"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_values_Self_group" {
  for_each       = toset(["No", "Yes"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Self.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_No_Self_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Self_group]
  for_each       = toset(["не", "нет"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Self.sid
  synonym_of     = "No"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_Yes_Self_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Self_group]
  for_each       = toset(["Д", "Да"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Self.sid
  synonym_of     = "Yes"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ru_HU_Age" {
  unique_name   = "Age"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_values_Age_group" {
  for_each       = toset(["Nem derült ki", "89", "88", "31", "61", "86", "47", "5", "92", "63", "24", "42", "9", "50", "75", "66", "58", "74", "48", "85", "39", "84", "87", "76", "38", "21", "8", "49", "17", "59", "96", "34", "26", "27", "28", "73", "22", "77", "79", "23", "64", "71", "82", "46", "98", "100", "68", "81", "16", "19", "95", "20", "44", "6", "37", "4", "99", "56", "90", "33", "12", "93", "15", "80", "70", "97", "91", "13", "51", "43", "67", "65", "29", "11", "57", "7", "54", "14", "94", "52", "78", "18", "41", "62", "25", "60", "55", "72", "35", "36", "1", "32", "69", "53", "3", "2", "10", "40", "83", "45", "30"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Age.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_Nem_derult_ki_Age_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Age_group]
  for_each       = toset(["x"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Age.sid
  synonym_of     = "Nem derült ki"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "chatbot_ru_HU_Gender" {
  unique_name   = "Gender"
  assistant_sid = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_values_Gender_group" {
  for_each       = toset(["Nem bináris", "Lány", "Fiú", "Nem derült ki"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Gender.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_Nem_binaris_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Gender_group]
  for_each       = toset(["nb", "не двоичный", "Небинарный"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Gender.sid
  synonym_of     = "Nem bináris"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_Fiu_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Gender_group]
  for_each       = toset(["Парень", "мальчик"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Gender.sid
  synonym_of     = "Fiú"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_Lany_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Gender_group]
  for_each       = toset(["девочка", "Девушка"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Gender.sid
  synonym_of     = "Lány"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "chatbot_ru_HU_synonymsOf_Nem_derult_ki_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.chatbot_ru_HU_values_Gender_group]
  for_each       = toset(["x"])
  assistant_sid  = twilio_autopilot_assistants_v1.chatbot_ru_HU.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.chatbot_ru_HU_Gender.sid
  synonym_of     = "Nem derült ki"
  value          = each.key
  language       = "en-US"
}
