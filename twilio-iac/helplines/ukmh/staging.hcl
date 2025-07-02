locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_post_survey                    = true
    enable_datadog_monitoring                = false
    custom_task_routing_filter_expression = "channelType IN ['web']  OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
      widget_from          = "MHI"
      chat_blocked_message = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/ukmh/templates/studio-flows/messaging-greeting-message-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}