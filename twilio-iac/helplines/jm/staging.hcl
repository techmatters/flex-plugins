locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "isContactlessTask==true OR channelType=='web' OR to=='+14244147346' OR twilioNumber=='whatsapp:+18767287042' OR twilioNumber=='instagram:17841453865951519'"

    #Studio flow
    flow_vars = {
      service_sid                           = "ZS9dbe7c77fe5f0a6ed3c392c63bba9c90"
      environment_sid                       = "ZE82cbf2bcb65cf4e44c436a24d3024fb5"
      capture_channel_with_bot_function_sid = "ZH07b25b75594049950f1b4384ceeedfcb"
      chatbot_callback_cleanup_function_sid = "ZHd8e7e7801687a833b4377b5c90305452"
      send_message_janitor_function_sid     = "ZHc95e14964d069413dea9f2afbb0b9a8d"
      bot_language                          = "en-JM"
      widget_from                           = "SafeSpot"
      chat_blocked_message                  = "Sorry, you're not able to contact SafeSpot from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."
    }
    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2-blocking-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = "instagram"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-lex-v3-blocking-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      whatsapp : {
        messaging_mode       = "conversations"
        channel_type         = "whatsapp"
        contact_identity     = "whatsapp:+18767287042"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v3-blocking-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

    ui_editable = false
    #Chatbots
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
    enable_integration_tests                  = true
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "Thank you for reaching out to SafeSpotJa. We're sorry, the helpline is experiencing technical difficulties with our chat system. If this is an emergency, please call 119 or reach out to the Intake Desk of the Office of the Children's Advocate at 876 275-956. Once we are up and running, a counsellor will get back to you. We apologize for the inconvenience and appreciate your patience"
      voice_message                    = "Thank you for reaching out to SafeSpotJa. We're sorry, the helpline is experiencing technical difficulties with our chat system. If this is an emergency, please call 119 or reach out to the Intake Desk of the Office of the Children's Advocate at 876 275-956. Once we are up and running, a counsellor will get back to you. We apologize for the inconvenience and appreciate your patience"
      send_studio_message_function_sid = "ZHff24c94f20bdac0edacfdc1beaaf426b"
      call_action                      = "message"
      forward_number                   = " +123"
      recording_url                    = "https://<place_holder>.mp3"

    }
  }
}