locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {


    custom_task_routing_filter_expression = "isContactlessTask==true OR channelType IN ['webchat', 'facebook', 'instagram', 'whatsapp'] OR  twilioNumber IN ['messenger:103574689075106', 'twitter:1540032139563073538', 'instagram:17841454586132629', 'whatsapp:+12135834846'] OR to IN ['+17752526377','+578005190671']"


    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars = {
          widget_from          = "Te Guío"
          chat_blocked_message = "Lamentablemente eres de y no puedes utilizar nuestros servicios."
        }
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode   = "conversations"
        channel_type     = "messenger"
        contact_identity = "messenger:103574689075106"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking-conv.tftpl"
        channel_flow_vars = {
          widget_from          = "Te Guío",
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message = "Lamentablemente eres de y no puedes utilizar nuestros servicios."
        }
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode   = "conversations"
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking-conv.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente eres de y no puedes utilizar nuestros servicios."
        }
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+12135834846"
        templatefile         = "/app/twilio-iac/helplines/co/templates/studio-flows/whatsapp.tftpl"
        channel_flow_vars    = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message  = "Lamentablemente eres de y no puedes utilizar nuestros servicios."        
        }
        chatbot_unique_names = []
      }
    }
    flow_vars = {
      service_sid                  = "ZSbf1bb881cc2e8db613ee6bca0e8e2c29"
      environment_sid              = "ZE339938daa781b8e21baa45feae0e1afe"
      operating_hours_function_sid = "ZH5fcc5dee5089c176acd0bd24e7fa873e"

    }


  }
}
