locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web']  OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
      widget_from                           = "National Child Helpline"

      chat_blocked_message                  = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
      error_message                         = "There has been an error with your message, please try writing us again."
      bot_language                          = "en-US"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}