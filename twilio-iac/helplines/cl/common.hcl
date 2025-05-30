locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Linea Libre"
    old_dir_prefix                    = "linealibre-cl"
    default_autopilot_chatbot_enabled = false
    task_language                     = "es-CL"
    voice_ivr_language                = "es-MX"
    enable_post_survey                = true
    enable_external_recordings        = true
    permission_config                 = "cl"
    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/cl/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      voice : {
        "target_workers" = "routing.skills HAS 'Llamadas'",
        "friendly_name"  = "Llamadas"
      },
      messaging : {
        "target_workers" = "routing.skills HAS 'Webchat'",
        "friendly_name"  = "Webchat"
      },
      priority : {
        "target_workers" = "routing.skills HAS 'Prioridad'",
        "friendly_name"  = "Prioridad/Emergencia"
      }
      everyone : {
        "target_workers" = "1==1",
        "friendly_name"  = "Everyone"
      }
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      }

    }
    task_channels = {
      default : "Default"
      chat : "Programmable Chat"
      voice : "Voice"
      sms : "SMS"
      video : "Video"
      email : "Email"
      survey : "Survey"
    }

    #Channels
    channels = {
      webchat : {
        channel_type           = "web"
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1d):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=23;BYMINUTE=0;BYDAY=MO,TU,WE,TH,FR"
            timezone = "America/Santiago"
          }
        }
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Te damos la bienvenida a Línea Libre, tu mensaje fue recibido exitosamente, la conversación será asignada a uno/a de nuestros psicólogos/as en los próximos instantes."
          chat_blocked_message  = "Hola, estás comunicándote con Línea Libre, un canal que ofrece una primera atención psicológica, y que busca apoyarte y orientarte en lo que sea que estés pasando. Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema. Si necesitas ayuda te recomendamos tomar contacto con Salud Responde al  6003607777. Si crees que tu número ha sido bloqueado por error, nos puedes escribir un mail a: contacto@paralaconfianza.com"
          widget_from           = "Linea Libre"
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1d):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=23;BYMINUTE=0;BYDAY=MO,TU,WE,TH,FR"
            timezone = "America/Santiago"
          }
        }
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hola, estás comunicándote con Línea Libre, un canal que ofrece una primera atención psicológica, y que busca apoyarte y orientarte en lo que sea que estés pasando. Antes de conversar, nos gustaría contarte que trabajamos bajo el principio de protección. Si percibimos que tu integridad o la de un tercero puede estar en riesgo, haremos lo necesario para asegurar tu protección y bienestar. Por tu seguridad, esta llamada podría ser grabada."
          voice_ivr_blocked_message  = "Hola, estás comunicándote con Línea Libre, un canal que ofrece una primera atención psicológica, y que busca apoyarte y orientarte en lo que sea que estés pasando. Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema. Si necesitas ayuda te recomendamos tomar contacto con Salud Responde al  6003607777. Si crees que tu número ha sido bloqueado por error, nos puedes escribir un mail a: contacto@paralaconfianza.com"
          voice_ivr_language         = "es-MX"
        }
        chatbot_unique_names = []
      }
    }
    phone_numbers = {
      khp : ["????"],
      g2t : ["????"],
    }

    lex_bot_languages = {
      es_CL : ["post_survey"]
    }
    lex_v2_bot_languages = {
      es_CL : ["post_survey"]
    }

  }
}
