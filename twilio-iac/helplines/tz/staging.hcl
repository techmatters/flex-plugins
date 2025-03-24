locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    enable_lex_v2                         = false
    lex_v2_bot_languages                  = false
    enable_datadog_monitoring             = false
    custom_task_routing_filter_expression = "channelType IN ['web','messenger']  OR isContactlessTask == true OR  twilioNumber == 'messenger:565233119996327'"

    #Studio flow
    flow_vars = {
      widget_from          = "C-Sema"
      chat_blocked_message = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
      send_message_janitor_function_sid = "ZH167067f5634dd8326504f0c43b5ac4e0"
      capture_channel_with_bot_function_sid = "ZH2b185a0342af6f903bf34461036006b7"
      chatbot_callback_cleanup_function_sid = "ZH00d5dbaf3effa441720fe6d04b856ddc"
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
      },
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:565233119996327"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}