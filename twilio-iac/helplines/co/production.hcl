/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber IN ['messenger:103538615719253', 'twitter:1532353002387931139', 'instagram:17841453197793547'] OR to == '+578005190690'"
    flow_vars = {
      service_sid                  = "ZS70d962b047c1cd528ad2f2cae9f33b8b"
      environment_sid              = "ZE5dd6ef3cbb63cc2418c472cd51fb2d16"
      operating_hours_function_sid = "ZHb7ef5682d731ce326be6d61c8a2b2fcf"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars    = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:103538615719253"
        templatefile         = "/app/twilio-iac/helplines/co/templates/studio-flows/messaging-flow.tftpl"
        channel_flow_vars    = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },
      instagram : {
        channel_type     = "custom"
        contact_identity = "instagram"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          widget_from           = "Te Guío"
          chat_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          chat_blocked_message = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "¡Hola, te damos la bienvenida a Te Guío! Esta es la línea de ayuda dedicada a adolescentes como tú, donde escuchamos y orientamos  las inquietudes que puedes tener para lograr vivir una sexualidad saludable. Qué gusto que te contactes con nosotros. Por favor espéranos mientras te contactamos con un Guía."
          voice_ivr_blocked_message = "Lamentablemente el número del cual llamas se encuentra bloqueado en nuestro sistema."
          voice_ivr_language         = "es-MX"
        }
        chatbot_unique_names = []
      }
    }
  }
}
