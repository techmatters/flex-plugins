/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    operating_hours_enforced_override     = false
    custom_task_routing_filter_expression = ""
    flow_vars = {
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-lambda-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
      /*,
      sms : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+16066032348"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-courage-first-lex-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }*/
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're currently experiencing technical issues, and your message might not be received. We apologize for the inconvenience."
      voice_message                    = "We're currently experiencing technical issues, and your call might not be received. We apologize for the inconvenience."
      send_studio_message_function_sid = ""
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
 }
}