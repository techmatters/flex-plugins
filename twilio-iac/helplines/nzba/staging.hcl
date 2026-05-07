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
      bot_language                      = "en_NZBA"
      widget_from                       = "Barnardos"
      chat_blocked_message              = "Sorry, you're not able to contact Barnardos from this device or account"
      error_message                     = "There has been an error with your message, please try writing us again."
      send_message_janitor_function_sid = "ZH17d7db67fa6ab6c2a8d8df2bef8fc55e"
    }

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-preq-lambda-sd.tftpl"
        channel_flow_vars = {
          widget_from                   = "Barnardos"
          chat_blocked_message          = "Sorry, you're not able to contact Barnardos from this device or account"
          send_message_webchat_prequeue = "Hello. Please hold on for a while and we will attend to you as soon as we can. Thank you for your patience!. If you are in immediate danger, please call the Police at 911."
        }
        chatbot_unique_names = []
      }
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-blocking-no-op-hours-sd.tftpl"
        channel_flow_vars = {
          play_message_voice_prequeue = "Hello. Please hold on for a while and we will attend to you as soon as we can. Thank you for your patience!."
          play_message_voice_blocked  = "Sorry, you're not able to contact Barnardos from this number"
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
    }

    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're currently experiencing technical issues, and your message may not be delivered. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      voice_message                    = "We're currently experiencing technical issues, and your call may not reach us. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      send_studio_message_function_sid = "ZHbbf0fb1ec68a5aacc31e8c50415b97bb"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-eu.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}