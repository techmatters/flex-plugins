locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_datadog_monitoring = true
    channels = {
      webchat : {
        channel_type           = "web"
        contact_identity       = ""
        templatefile           = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging-webchat-lambda-sd.tftpl"
        channel_flow_vars      = {}
        chatbot_unique_names   = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1w):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=10;BYMINUTE=0;BYDAY=MO"
            timezone = "America/Santiago"
          }
        }
      },
      facebook : {
        messaging_mode         = "conversations"
        channel_type           = "messenger"
        contact_identity       = "messenger:261976427221327"
        templatefile           = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging-conv-lambda-sd.tftpl"
        channel_flow_vars      = {}
        chatbot_unique_names   = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1w):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=10;BYMINUTE=0;BYDAY=MO"
            timezone = "America/Santiago"
          }
        }
      },
      whatsapp : {
        messaging_mode         = "conversations"
        channel_type           = "whatsapp"
        contact_identity       = "whatsapp:+260973553422"
        templatefile           = "/app/twilio-iac/helplines/zm/templates/studio-flows/messaging-conv-lambda-sd.tftpl"
        channel_flow_vars      = {}
        chatbot_unique_names   = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1w):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=10;BYMINUTE=0;BYDAY=MO"
            timezone = "America/Santiago"
          }
        }
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/zm/templates/studio-flows/voice-ac.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_24h):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=DAILY;INTERVAL=1;BYHOUR=10;BYMINUTE=0"
            timezone = "Africa/Johannesburg"
          }
        }
      }
    }
    #Studio flow
    flow_vars = {
      service_sid                           = "ZS6ac8653b2845b206a0a0bbdda861e3e9"
      environment_sid                       = "ZEe7486f2ebe86b00591d4550ab0389566"
      send_message_janitor_function_sid     = "ZH55f6e780a85d1371f00234481fee3b35"
      capture_channel_with_bot_function_sid = "ZH38598267c5c40e659e4fef46a019dd24"
      chatbot_callback_cleanup_function_sid = "ZHbd87dea9b87da5ca3b8de882fe503d91"
      widget_from                           = "Lifeline/Childline Zambia"
      chat_blocked_message                  = "Hi, you've been blocked from accessing Childline/Lifeline services and we are not able to read or receive further messages from you."
      voice_ivr_language                    = "en-US",
      voice_ivr_blocked_message             = "Hi, you've been blocked from accessing Childline/Lifeline services and we are not able to receive further calls from you."
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "Our chat system is currently experiencing technical difficulties. We apologize for the inconvenience and are working to get it back online as soon as possible. If this is an emergency, please call +260955065373. Please note that this is not a toll-free line so you may incur costs."
      voice_message                    = "Our chat system is currently experiencing technical difficulties. We apologize for the inconvenience and are working to get it back online as soon as possible. If this is an emergency, please call +260955065373. Please note that this is not a toll-free line so you may incur costs."
      send_studio_message_function_sid = "ZH444841aeca809d0c028b3c716c15a335"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
  }
}