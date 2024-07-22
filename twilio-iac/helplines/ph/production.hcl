locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = []

  local_config = {

   flow_vars = {
    service_sid                           = "ZSb150787b898e08503b14c152ff2d67c0"
    environment_sid                       = "ZE23e7e655d8037662a53530e7fcc98ed2"
    capture_channel_with_bot_function_sid = "ZHcca7605b98d421e9a6ca3056117cdf44"
    operating_hours_function_sid          = "ZH6a5fd13e2faf9d0ff507b3dbdec53612"
    widget_from                           = "ECPAT"
    chat_blocked_message                  = "Sorry, you're not able to contact ECPAT from this device or account"
  }


   channels = {
    facebook : {
      channel_type      = "facebook"
      contact_identity  = "messenger:550013548423077"
      templatefile      = "/app/twilio-iac/helplines/ph/templates/studio-flows/with-lex-chatbot.tftpl"
      channel_flow_vars = {}
      chatbot_unique_names = []
    }
  }

    
  }
}