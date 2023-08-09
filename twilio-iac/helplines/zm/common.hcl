locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "ChildLine Zambia"
    old_dir_prefix                    = ""
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-US"
    voice_ivr_language                = ""
    enable_post_survey                = false

    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/zm/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      lifeline : {
        "target_workers" = "1==1",
        "friendly_name"  = "LifeLine Zambia (ZM)"
      },
      childline : {
        "target_workers" = "1==1",
        "friendly_name"  = "ChildLine Zambia (ZM)"
      },
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
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Te damos la bienvenida a Línea Libre, tu mensaje fue recibido exitosamente, la conversación será asignada a uno/a de nuestros psicólogos/as en los próximos instantes."
          widget_from           = "Linea Libre"
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hola, estás comunicándote con Línea Libre, un canal que ofrece una primera atención psicológica, y que busca apoyarte y orientarte en lo que sea que estés pasando. Antes de conversar, nos gustaría contarte que trabajamos bajo el principio de protección. Si percibimos que tu integridad o la de un tercero puede estar en riesgo, haremos lo necesario para asegurar tu protección y bienestar. Por tu seguridad, esta llamada podría ser grabada."
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
      
    }

  }
}
