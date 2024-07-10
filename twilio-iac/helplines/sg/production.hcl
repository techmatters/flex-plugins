/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    helpline_region = "eu-west-1"

    custom_task_routing_filter_expression = ""
    flow_vars = {
      service_sid                   = "ZSbfebd43b19b4db9e3bd763b72b101eaf"
      environment_sid               = "ZE12ad6d59ba95d24d43e184a21cfe3669"
      operating_hours_function_sid  = "ZH95bf7c7442969d4577caa5b656957f53"
      operating_hours_function_name = "operatingHours"
    }

    //Serverless -- to allow enabling the operating hours check on this account.
    ui_editable = true

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Hello! Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/sg/templates/studio-flows/voice-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          voice_ivr_language         = "en-US",
          voice_ivr_greeting_message = "Hello! Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can."

          welcome_message_url = "https://sg-services-4304.twil.io/welcome_Message.mp3"
          busy_message_url    = "https://sg-services-4304.twil.io/busy_Message.mp3"
          closed_message_url  = "https://sg-services-4304.twil.io/closed_Message.mp3"
        }
        chatbot_unique_names = []
      }
    }
  }

}
