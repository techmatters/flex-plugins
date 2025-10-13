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
      # Webchat
      vc_url = "https://assets-staging.tl.techmatters.org/webchat/usvc/vc-test-chat.html"
      dcvh_url = "https://assets-staging.tl.techmatters.org/webchat/usvc/dcvh-test-chat.html"
      send_message_webchat_no_service = "This message is sent when the user has selected the option 'No' to the question 'Are you in a safe place?'"
      send_message_vc_webchat_prequeue = "This is the message send_message_vc_webchat_prequeue"
      send_message_dcvh_webchat_prequeue = "This is the message send_message_dcvh_webchat_prequeue"
      
      # VC SMS
      send_message_vc_sms_welcome = "This is the welcome message send_message_vc_sms_welcome"
      send_wait_vc_sms_safety = "This is the welcome message send_wait_vc_sms_safety  "
      send_message_vc_sms_no_service = "This is the welcome message send_message_vc_sms_no_service"
      send_message_vc_sms_prequeue = "This is the welcome message send_message_vc_sms_prequeue"

      # DCVH SMS
      send_message_dcvh_sms_welcome = "This is the welcome message send_message_dcvh_sms_welcome"
      send_wait_dcvh_sms_safety = "This is the welcome message send_wait_dcvh_sms_safety  "
      send_message_dcvh_sms_no_service = "This is the welcome message send_message_dcvh_sms_no_service"
      send_message_dcvh_sms_prequeue = "This is the welcome message send_message_dcvh_sms_prequeue"

      # VC Voice
      play_message_vc_voice_welcome = "This is the welcome message play_message_vc_voice_welcome"
      play_message_vc_voice_language = "This is  the language question. Press 1 for English and 2 for Spanish."
      play_message_vc_voice_en_prequeue = "This is the english prequeue message for VC"
      play_message_vc_voice_sp_prequeue = "This is the spanish prequeue message for VC"

      # DCVH Voice
      play_message_dcvh_voice_welcome = "This is the welcome message play_message_dcvh_voice_welcome"
      play_message_dcvh_voice_language = "This is  the language question. Press 1 for English and 2 for Spanish."
      play_message_dcvh_voice_en_prequeue = "This is the english prequeue message for DCVH"
      play_message_dcvh_voice_sp_prequeue = "This is the spanish prequeue message for DCVH"
      play_message_dcvh_voice_dispatch_prequeue = "This is the dispatch prequeue message for DCVH"
      


      
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/webchat-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice_vc : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/voice-vc-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice_dcvh : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/voice-dcvh-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      sms_dcvh : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+12029984483"
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/sms-dcvh-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      sms_vc : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+12345622296"
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/sms-vc-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're currently experiencing technical issues, and your message might not be received. We apologize for the inconvenience."
      voice_message                    = "We're currently experiencing technical issues, and your call might not be received. We apologize for the inconvenience."
      send_studio_message_function_sid = "ZH4b9cf9eb89b74a9ae256a731f8f4bc99"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
 }
}