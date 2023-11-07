locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType ==\"web\"  OR isContactlessTask == true"
    #Studio flow
    flow_vars = {
      service_sid                           = "ZS35f2808923f66b3f26005e3ad25d0ebf"
      environment_sid                       = "ZEe07e61af2173569a54771a9d9c37d023"
      capture_channel_with_bot_function_sid = "ZH9b4b43a78bd15fd1d999583d39de463a"
      operating_hours_function_sid          = "ZHdad310884acb22bd5079b22ac795ee51"
      bot_language                          = "en"
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/et/templates/studio-flows/messaging-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }

  }
}