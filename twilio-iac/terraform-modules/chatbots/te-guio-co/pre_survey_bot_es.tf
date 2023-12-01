resource "twilio_autopilot_assistants_v1" "pre_survey_bot_es" {
  unique_name   = "pre_survey_bot_es"
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

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_counselor_handoff" {
  unique_name   = "counselor_handoff"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
	"actions": [
		{
			"say": "¡Muchas gracias! En un momento uno de nuestros guías te atenderá. Por fa espéranos..."
		}
	]
})
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_social_media_msg" {
  unique_name   = "social_media_msg"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "¡OK!, deja tu mensaje y alguien de nuestro equipo de responderá lo más pronto posible."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_no_approval_msg" {
  unique_name   = "no_approval_msg"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Lo siento, en este caso, no podemos brindarte el servicio. Contáctanos de nuevo si cambias de opinión. Ya sabes siempre estamos aquí para asesorarte."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_get_personal_data" {
  unique_name   = "get_personal_data"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_personal_data"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "get_personal_data",
          "questions" : [
            {
              "question" : "¡Perfecto!  ¿Nos podrías proporcianar los siguientes datos?:\n-Tus nombres y apellidos.\n-Tu género (opcional): femenino/ masculino/ no binario.\n-Tu número de identificación.\n-Ciudad o municipio en el que te encuentras.\n-Dirección.\n-Número de celular.\n-Correo electrónico (si cuentas con uno).\n-EPS.\nSi estás de acuerdo, nos ayudarías un montón al escribir estos datos en un solo mensaje.",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_get_terms_approval" {
  unique_name   = "get_terms_approval"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_terms_approval"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "get_terms_approval",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Por fa, responde Sí o No..."
                    },
                    {
                      "say" : "No entendí, ¿Puedes tratar de nuevo?"
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
              "question" : "Perfecto,  quiero que  sepas  que  la  conversación que tendrás con el guía  será  completamente confidencial. Sin embargo, como tú sabes, el tema de protección de datos es muy  importante  tanto  para  ti  como  para  nosotros,  por  lo  cual,  debo  preguntarte  si  aceptas los Términos y Condiciones del Servicio (https://tinyurl.com/269m72c9) Responde con el número que corresponda: \n1: Sí, acepto. \n2: No, no acepto.",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_get_is_with_caregiver" {
  unique_name   = "get_is_with_caregiver"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_is_with_caregiver"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "get_is_with_caregiver",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Recuerda las opciones 1, 2 o 3."
                    },
                    {
                      "say" : "No he entendido, ¿Me puedes repetir?"
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
                    "3",
                    "1.",
                    "2.",
                    "3."
                  ]
                }
              },
              "question" : "Perfecto, para prestar este servicio, así como para recibir y tratar adecuadamente tu datos personales requerimos la autorización de tu padre o de tu madre. Por fa, escribe el solo el número de la opción que corresponda: \n1: Si te encuentras en este momento con tu padre, tu madre o tu tutor legal.\n2: Si no te encuentras en este momento con tu padre, tu madre o tu tutor legal.\n3: Si tu padre, madre o tu tutor legal te están haciendo algún tipo de daño.",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_no_caregiver_msg" {
  unique_name   = "no_caregiver_msg"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Lo siento, en este caso, necesitamos esperar hasta que podamos conversar con tu mamá, papá o tutor legal. Por favor, avísanos apenas podamos hacerlo. Si no están en este momento contigo, vuelve a contactarnos cuando lo estén."
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_get_age_for_consent" {
  unique_name   = "get_age_for_consent"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_age_for_consent"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "get_age_for_consent",
          "questions" : [
            {
              "type" : "AgeForConsent",
              "question" : "¡Muchas gracias! Para iniciar la atención con un profesional, nos gustaría saber ¿Cuántos años tienes? Escribe solo el número correspondiente a tu edad. ",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_request_question_msg" {
  unique_name   = "request_question_msg"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "request_question_msg"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "request_question_msg",
          "questions" : [
            {
              "question" : "Por favor, escríbenos tu pregunta...",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_get_counseling_type" {
  unique_name   = "get_counseling_type"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_counseling_type"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "get_counseling_type",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "No reconozco esa opción, puedes escribir 1 o 2."
                    },
                    {
                      "say" : "No entendí, escribe la opción que se acomode a lo que necesitas:\n1: Tienes una duda o inquietud y deseas que la respondamos por este chat.\n2: Deseas tener una cita virtual y recibir una orientación personalizada."
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
              "question" : "Esta es la línea de ayuda dedicada a adolescentes como tú, donde te escuchamos y orientamos en las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Que gusto que te contactes con nosotros. \nPara empezar, necesitamos que escribas únicamente el número de una de las siguientes opciones según tu caso.\n1: Tienes una duda o inquietud y deseas que la respondamos por este chat.\n2: Deseas tener una cita virtual y recibir una orientación personalizada.",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_get_contact_reason" {
  unique_name   = "get_contact_reason"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "callerTask" : "get_contact_reason"
        }
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
          },
          "name" : "get_contact_reason",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "No reconozco esa opción, puedes escribir 1, 2 o 3."
                    },
                    {
                      "say" : "No entendí. Por fa, escribe: \n 1: Si tienes una emergencia. \n 2: Si quieres contactarte con la Línea de Ayuda. \n 3: Cualquier otra solicitud."
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
                    "3",
                    "1.",
                    "2.",
                    "3."
                  ]
                }
              },
              "question" : "¡Bienvenido/a a Te Guío!,  Por fa, escribe solo el número de la opción que corresponda: \n 1: Si tienes una emergencia. \n 2: Si quieres contactarte con la Línea de Ayuda. \n 3: Cualquier otra solicitud.",
              "name" : "user_choice"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_execute_initial_flow" {
  unique_name   = "execute_initial_flow"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "flowTree" : {
            "execute_initial_flow" : {
              "get_contact_reason" : {
                "1" : "counselor_handoff",
                "2" : {
                  "get_counseling_type" : {
                    "1" : {
                      "request_question_msg" : "counselor_handoff"
                    },
                    "2" : {
                      "get_age_for_consent" : {
                        "<14" : {
                          "get_is_with_caregiver" : {
                            "1" : "counselor_handoff",
                            "2" : "no_caregiver_msg",
                            "3" : "counselor_handoff"
                          }
                        },
                        ">=14" : {
                          "get_terms_approval" : {
                            "1" : {
                              "get_personal_data" : "counselor_handoff"
                            },
                            "2" : "no_approval_msg"
                          }
                        }
                      }
                    }
                  }
                },
                "3" : "social_media_msg"
              }
            }
          },
          "callerTask" : "execute_initial_flow"
        }
      },
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "https://test-not-yet-approved-2847.twil.io/flow-handler"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_es_execute_initial_flow_group" {
  for_each      = toset(["hola"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_es_execute_initial_flow.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_collect_fallback" {
  unique_name   = "collect_fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_goodbye" {
  unique_name   = "goodbye"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "¡Gracias! Ya sabes siempre estamos aquí para asesorarte. ¡Adiós!"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_es_goodbye_group" {
  for_each      = toset(["eso sería", "chao", "adios", "that's all", "good bye", "stop talking", "see ya", "bye bye", "stop", "goodnight", "no", "cancel", "goodbye", "go away", "that would be all", "no thanks", "that is all thank you", "no thanks", "that would be all thanks", "that's all for today"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_es_goodbye.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Hello, what can I help you with today?"
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "pre_survey_bot_es_greeting_group" {
  for_each      = toset(["what can you do", "whatsup", "hey", "sup", "what do you do", "hi there", "hi!", "yo", "what'us up", "good afternoon", "Hello.", "hi there.", "hello", "good morning", "Hi", "heya"])
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.pre_survey_bot_es_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "pre_survey_bot_es_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
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

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_es_NumberReply" {
  unique_name   = "NumberReply"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_values_NumberReply_group" {
  for_each       = toset(["3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_NumberReply.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_1_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["1!", "1."])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_NumberReply.sid
  synonym_of     = "1"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_2_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["2!", "2."])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_NumberReply.sid
  synonym_of     = "2"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_3_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["3!", "3."])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_NumberReply.sid
  synonym_of     = "3"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_es_SiNo" {
  unique_name   = "SiNo"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_values_SiNo_group" {
  for_each       = toset(["no", "si"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_SiNo.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_no_SiNo_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_SiNo_group]
  for_each       = toset(["¡no!", "no!", "noo"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_SiNo.sid
  synonym_of     = "no"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_si_SiNo_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_SiNo_group]
  for_each       = toset(["¡si!", "si!", "sii"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_SiNo.sid
  synonym_of     = "si"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_v1" "pre_survey_bot_es_AgeForConsent" {
  unique_name   = "AgeForConsent"
  assistant_sid = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_values_AgeForConsent_group" {
  for_each       = toset([">=14", "<14"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_AgeForConsent.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_over14_AgeForConsent_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_AgeForConsent_group]
  for_each       = toset(["60", "59", "58", "57", "56", "55", "54", "53", "52", "51", "50", "49", "48", "47", "46", "45", "44", "43", "42", "41", "40", "39", "38", "37", "36", "35", "34", "33", "32", "31", "30", "29", "28", "27", "26", "25", "24", "23", "22", "21", "20", "19", "18", "17", "16", "15", "14"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_AgeForConsent.sid
  synonym_of     = ">=14"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "pre_survey_bot_es_synonymsOf_under14_AgeForConsent_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.pre_survey_bot_es_values_AgeForConsent_group]
  for_each       = toset(["13", "12", "11", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.pre_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.pre_survey_bot_es_AgeForConsent.sid
  synonym_of     = "<14"
  value          = each.key
  language       = "en-US"
}
