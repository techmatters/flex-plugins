locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType IN ['web','voice','sms']  OR isContactlessTask == true"
    permission_config                     = "usnc"

    #Studio flow
    flow_vars = {
      widget_from                           = "Promise Resource Network"
      chat_blocked_message                  = "Sorry, you're not able to contact Promise Resource Network from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting Promise Resource Network. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-eu.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}