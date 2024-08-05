locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {


    custom_task_routing_filter_expression = "isContactlessTask==true OR channelType=='web'  OR  twilioNumber IN ['messenger:103574689075106', 'twitter:1540032139563073538', 'instagram:17841454586132629', 'whatsapp:+12135834846'] OR to IN ['+17752526377','+578005190671']"


    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:103574689075106"
        templatefile         = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          from             = "Te Guío"
          greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-no-chatbot-operating-hours-blocking..tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          voice_ivr_blocked_message = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
          voice_ivr_language         = "es-MX"
        }
        chatbot_unique_names = []
      }
    }
    flow_vars = {
      service_sid                      = "ZSbf1bb881cc2e8db613ee6bca0e8e2c29"
      environment_sid                  = "ZE339938daa781b8e21baa45feae0e1afe"
      operating_hours_function_sid     = "ZH5fcc5dee5089c176acd0bd24e7fa873e"

    }


  }
}
