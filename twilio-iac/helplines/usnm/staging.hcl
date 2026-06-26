/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars = {
      widget_from                              = "NAMI"
      chat_blocked_message                     = "Hi, you've been blocked from accessing NAMI services and we are not able to read or receive further messages from you."
      send_message_prequeue                    = "Welcome. Pleas wait for a specialist."
      custom_functions_url                     = "https://custom-functions-4084.twil.io"
      usnm_recordings_url                      = "https://usnm-recordings-6200.twil.io"
      is_skilled_worker_available_function_sid = "ZH85007840bfdc6245a8ffb08d98aad0eb"
      workspace_sid                            = "WSb9cb11d86ddcb7954dcdd20c391a7edc"
    }


    #Channels
    channels = {
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usnm/templates/studio-flows/voice.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting NAMI. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
      chat : {
        messaging_mode       = "conversations"
        channel_type         = "chat"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/usnm/templates/studio-flows/messaging-blocking-conv-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
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

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-us.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}