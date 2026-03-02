locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_external_recordings            = true
    enable_post_survey                    = true
    enable_datadog_monitoring             = false
    custom_task_routing_filter_expression = "channelType IN ['web','voice']  OR isContactlessTask == true"
    permission_config                     = "nzba"

    #Studio flow
    flow_vars = {
      bot_language                          = "en_NZBA"
      widget_from                           = "Barnardos"
      chat_blocked_message                  = "Sorry, you're not able to contact Barnardos from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."
      send_message_janitor_function_sid     = "ZH17d7db67fa6ab6c2a8d8df2bef8fc55e"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting Barnardos. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-eu.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}