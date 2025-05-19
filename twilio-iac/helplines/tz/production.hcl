locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web']  OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
      widget_from                           = "National Child Helpline"
      send_message_janitor_function_sid     = "ZHd8b1112c9bc6a7798fa18c82cd3bff2d"
      capture_channel_with_bot_function_sid = "ZH2b185a0342af6f903bf34461036006b7"
      chatbot_callback_cleanup_function_sid = "ZH6fb9b38bf4c52e8d4786e7a24f434cc9"
      chat_blocked_message                  = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
      error_message                         = "There has been an error with your message, please try writing us again."
      bot_language                          = "en-US"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}