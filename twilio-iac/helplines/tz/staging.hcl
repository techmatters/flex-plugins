locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    enable_datadog_monitoring                = false
    custom_task_routing_filter_expression = "channelType IN ['web','messenger']  OR isContactlessTask == true OR  twilioNumber == 'messenger:565233119996327'"

    #Studio flow
    flow_vars = {
      widget_from          = "C-Sema"
      chat_blocked_message = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/webchat-basic.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:565233119996327"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}