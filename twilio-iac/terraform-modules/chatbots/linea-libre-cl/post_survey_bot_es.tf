resource "twilio_autopilot_assistants_v1" "post_survey_bot_es" {
  unique_name   = "post_survey_bot_es_cl"
  friendly_name = "A bot that collects a post-survey"
  style_sheet = jsonencode({
    "style_sheet" : {
      "voice" : {
        "say_voice" : "Polly.Salli"
      }
    }
  })
  defaults = jsonencode({
    "defaults" : {
      "assistant_initiation" : "",
      "fallback" : ""
    }
  })
  log_queries = true
}

resource "twilio_autopilot_assistants_tasks_v1" "post_survey_bot_es_fallback" {
  unique_name   = "fallback"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
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

resource "twilio_autopilot_assistants_tasks_v1" "post_survey_bot_es_decline" {
  unique_name   = "decline"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : "task://complete_post_survey"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "post_survey_bot_es_decline_group" {
  for_each      = toset(["no", "adios", "no", "adios", "no", "2", "2"])
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.post_survey_bot_es_decline.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_tasks_v1" "post_survey_bot_es_collect_feedback" {
  unique_name   = "collect_feedback"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "say" : "Looks like I'm having trouble. Apologies for that."
      },
      {
        "listen" : true
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "post_survey_bot_es_complete_post_survey" {
  unique_name   = "complete_post_survey"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "complete_post_survey"
        }
      },
      {
        "redirect" : {
          "method" : "POST",
          "uri" : "${var.serverless_url}/postSurveyComplete"
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "post_survey_bot_es_survey" {
  unique_name   = "survey"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "remember" : {
          "at" : "survey"
        }
      },
      {
        "say" : "Las respuestas de este formulario son anónimas y serán utilizadas para poder realizar mejoras en nuestro canal de chat Línea Libre. Al responder la encuesta significa que usted acepta los términos, si no, solo cierre la ventana o termine la conversación."
      },
      {
        "collect" : {
          "on_complete" : {
            "redirect" : "task://complete_post_survey"
          },
          "name" : "collect_survey",
          "questions" : [
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Lo siento, no entendí.."
                    },
                    {
                      "say" : "No entendí, ¿Me puedes repetir?"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://collect_fallback",
                  "num_attempts" : 2
                }
              },
              "question" : "¿La atención recibida me ayudó a encontrar estrategias o planes de acción para abordar el malestar por el cual consulté? Escriba el número que corresponda: \n 1 - No me ayudó nada \n2 - Me ayudó poco \n3 - Me ayudó \n4 - Me ayudó mucho",
              "name" : "wasHelpful"
            },
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Lo siento, no entendí.."
                    },
                    {
                      "say" : "No entendí, ¿Me puedes repetir?"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://collect_fallback",
                  "num_attempts" : 2
                }
              },
              "question" : "¿Te sentiste escuchado/a y apoyado/a por la/el psicólogo que te atendió?  Escriba el número que corresponda:\n1 - No me sentí escuchad@ \n2 - Me sentí  poco escuchad@ \n3 - Me sentí escuchad@ \n4 - Me sentí muy escuchad@",
              "name" : "feltSupported"
            },
            {
              "type" : "NumberReply",
              "validate" : {
                "on_failure" : {
                  "repeat_question" : true,
                  "messages" : [
                    {
                      "say" : "Lo siento, no entendí.."
                    },
                    {
                      "say" : "No entendí, ¿Me puedes repetir?"
                    }
                  ]
                },
                "max_attempts" : {
                  "redirect" : "task://collect_fallback",
                  "num_attempts" : 2
                }
              },
              "question" : "¿Recomendarías el servicio de chat de Línea Libre a otras personas? Escriba el número que corresponda:\n1 - Sí \n2 - No",
              "name" : "wouldRecommend"
            }
          ]
        }
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_v1" "post_survey_bot_es_greeting" {
  unique_name   = "greeting"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  actions = jsonencode({
    "actions" : [
      {
        "redirect" : "task://survey"
      }
    ]
  })
}

resource "twilio_autopilot_assistants_tasks_samples_v1" "post_survey_bot_es_greeting_group" {
  for_each      = toset(["si", "1", "1", "saludos", "hola"])
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  task_sid      = twilio_autopilot_assistants_tasks_v1.post_survey_bot_es_greeting.sid
  language      = "en-US"
  tagged_text   = each.key
}

resource "twilio_autopilot_assistants_field_types_v1" "post_survey_bot_es_NumberReply" {
  unique_name   = "NumberReply"
  assistant_sid = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "post_survey_bot_es_values_NumberReply_group" {
  for_each       = toset(["4", "3", "2", "1"])
  assistant_sid  = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.post_survey_bot_es_NumberReply.sid
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "post_survey_bot_es_synonymsOf_1_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.post_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["1!", "1."])
  assistant_sid  = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.post_survey_bot_es_NumberReply.sid
  synonym_of     = "1"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "post_survey_bot_es_synonymsOf_2_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.post_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["2!", "2."])
  assistant_sid  = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.post_survey_bot_es_NumberReply.sid
  synonym_of     = "2"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "post_survey_bot_es_synonymsOf_3_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.post_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["3!", "3."])
  assistant_sid  = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.post_survey_bot_es_NumberReply.sid
  synonym_of     = "3"
  value          = each.key
  language       = "en-US"
}

resource "twilio_autopilot_assistants_field_types_field_values_v1" "post_survey_bot_es_synonymsOf_4_NumberReply_group" {
  depends_on     = [twilio_autopilot_assistants_field_types_field_values_v1.post_survey_bot_es_values_NumberReply_group]
  for_each       = toset(["4!", "4."])
  assistant_sid  = twilio_autopilot_assistants_v1.post_survey_bot_es.sid
  field_type_sid = twilio_autopilot_assistants_field_types_v1.post_survey_bot_es_NumberReply.sid
  synonym_of     = "4"
  value          = each.key
  language       = "en-US"
}
