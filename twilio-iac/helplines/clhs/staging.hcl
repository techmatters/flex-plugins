/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web']"
    flow_vars = {
      widget_from                           = "Hora Segura"
      chat_blocked_message                  = "Hola, perdona, has sido bloqueado temporalmente de nuestros servicios."
      send_message_webchat_welcome_prequeue = "¡Hola! Te damos la bienvenida a este espacio seguro para conversar. En instantes te pondremos en contacto con nuestro equipo para poder iniciar la conversación. "
    }
    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-welcome-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"

    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "Perdona, nuestro sistema está experimentando algunos problemas técnicos. Tu contacto puede que no llegue a ser atendido o experimente interrupciones."
      voice_message                    = "Our chat system is currently experiencing technical difficulties. We apologize for the inconvenience and are working to get it back online as soon as possible. If this is an emergency, please call +260955065373. Please note that this is not a toll-free line so you may incur costs."
      send_studio_message_function_sid = ""
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
  }

}