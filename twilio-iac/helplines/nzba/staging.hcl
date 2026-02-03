locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_external_recordings = true
    enable_post_survey                    = true
    enable_datadog_monitoring             = false
    custom_task_routing_filter_expression = "channelType IN ['web','voice']"
    permission_config                     = "demo"

    #Studio flow
    flow_vars = {

      widget_from                           = "Barnardos"
      chat_blocked_message                  = "Sorry, you're not able to contact Barnardos from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."

    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-welcome-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic-sd.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting Barnardos. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"

    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down    = true
    system_down_flow_vars    = {
      is_system_down   = "false"
      message = "We're currently experiencing technical issues, and your message may not be delivered. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      voice_message = "We're currently experiencing technical issues, and your call may not reach us. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      call_action = "message"
      forward_number = "+123"
      recording_url = "https://<place_holder>.mp3"

    }
  }
}