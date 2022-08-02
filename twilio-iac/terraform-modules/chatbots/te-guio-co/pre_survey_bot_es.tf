resource "twilio_autopilot_assistants_v1" "pre_survey_bot_es" {
  unique_name   = "demo_chatbot"
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

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_survey" {
  unique_name   = "survey"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey"
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
              "type" : "Age",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Perdona, no te entendí. Por favor responde solo con un número."
                    },
                    {
                      "say" : "Perdona, sigo sin entender."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "¿Qué edad tienes?",
              "name" : "age"
            },
            {
              "type" : "Gender",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Perdona, no te entendí. Por favor trata de nuevo."
                    },
                    {
                      "say" : "Perdona, sigo sin entender."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "¿Cuál es tu género? (niño, niña, desconocido, hombre, mujer, no binario, etc.)",
              "name" : "gender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Perdona, no he entendido bien. Por favor trata de nuevo."
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_gender_why" {
  unique_name   = "gender_why"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
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
                      "say" : "Entendido."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 1
                },
                "allowed_values" : {
                  "list" : [
                    "Niño",
                    "Niña",
                    "No-binario"
                  ]
                }
              },
              "question" : "Preguntamos por género--si te indetificas como niña, niño o ninguno--para poder entender quien usa nuestra línea de ayuda. Si te incomoda la pregunta, solo contesta 'prefiero no responder'.",
              "name" : "gender"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Parece que estoy experimentando problemas. Mis disculpas al respecto. Partamos de nuevo, ¿Cómo te puedo ayudar hoy?"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "greeting"
        }
      },
      {
        "say" : "Bienvenido a Te Guío. Para poder ayudarte mejor, por favor responde las siguientes tres preguntas."
      },
      {
        "redirect" : "task://survey_start"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_es_greeting_group" {
  for_each      = toset(["hola", "hola!", "buen dia", "buenos dias", "buenas tardes", "buenas noches", "que tal", "que sabes hacer", "que pasa", "Q hubo", "Que hubo", "Como va"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_es_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Muchas gracias! Por favor contáctanos de nuevo si necesitas cualquier cosa. Adiós!."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_es_goodbye_group" {
  for_each      = toset(["detente", "adiós", "chao", "chaolin", "no gracias", "gracias", "eso seria todo", "no necesito nada mas", "nada mas"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_es_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_survey_start" {
  unique_name   = "survey_start"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey_start"
        }
      },
      {
        "say" : "Puedes responder 'prefiero no responder' (o escribe una 'X') a cualquiera de las preguntas."
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://survey"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "Twilio.FIRST_NAME",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Perdona, no te entendí..."
                    },
                    {
                      "say" : "Todavía no entiendo."
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://redirect_function",
                  "num_attempts" : 2
                }
              },
              "question" : "¿Cuál es tu nombre?",
              "name" : "first_name"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_redirect_function" {
  unique_name   = "redirect_function"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "sendToAgent" : true,
          "at" : "counselor_handoff"
        }
      },
      {
        "say" : "Te transferiremos ahora. Por favor espera por un guía."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_es_Gender" {
  unique_name   = "Gender"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_values_Gender_group" {
  for_each       = toset(["masculino", "femenino", "Desconocido", "no-binario"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Gender.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_femenino_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_Gender_group]
  for_each       = toset(["nena", "chica", "niña", "mujer"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Gender.sid
  synonym_of     = "femenino"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_masculino_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_Gender_group]
  for_each       = toset(["nene", "chico", "niño", "hombre"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Gender.sid
  synonym_of     = "masculino"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_Desconocido_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_Gender_group]
  for_each       = toset(["prefiero no responder", "prefiero no responde", "X"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Gender.sid
  synonym_of     = "Desconocido"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_no-binario_Gender_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_Gender_group]
  for_each       = toset(["no binario", "sin genero", "nobinario"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Gender.sid
  synonym_of     = "no-binario"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_es_Age" {
  unique_name   = "Age"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_values_Age_group" {
  for_each       = toset(["63", "45", "71", "10", "81", "13", "23", "9", "21", "37", "70", "53", "42", "54", "58", "98", "28", "24", "49", "40", "8", "79", "62", "69", "48", "31", "91", "85", "61", "47", "60", "22", "56", "97", "76", "15", "51", "18", "46", "94", "34", "100", "75", "41", "44", "32", "68", "89", "19", "87", "35", "26", "93", "52", "80", "67", "6", "82", "57", "50", "25", "16", "72", "78", "43", "11", "33", "55", "88", "27", "73", "5", "95", "39", "4", "92", "3", "14", "17", "1", "12", "7", "83", "65", "20", "2", "36", "99", "59", "96", "84", "74", "77", "38", "66", "64", "29", "Unknown", "86", "90"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Age.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_Unknown_Age_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_Age_group]
  for_each       = toset(["prefer not", "Prefer not to answer", "X", "prefer not to"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_Age.sid
  synonym_of     = "Unknown"
  value          = each.key
  language       = "en-US"
}
