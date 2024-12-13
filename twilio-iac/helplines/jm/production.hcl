locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    enable_datadog_monitoring             = true
    custom_task_routing_filter_expression = "isContactlessTask==true OR helpline=='SafeSpot' OR channelType=='web' OR to=='+14244147346' OR to=='+18767287042' OR twilioNumber=='instagram:17841444523369053' OR twilioNumber=='messenger:107246798170317'"

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2-blocking.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1w):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=10;BYMINUTE=0;BYDAY=MO"
            timezone = "America/Santiago"
          }
        }
      },
      instagram : {
        messaging_mode         = "conversations"
        channel_type           = "custom"
        contact_identity       = "instagram"
        templatefile           = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-lex-v3-blocking.tftpl"
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
      }
    }

    #Studio flow
    flow_vars = {
      service_sid                           = "ZSf7422a38f3b243b8aab97ca268f4ce6b"
      environment_sid                       = "ZE471872ba9e5a44ea96c773adb2b9076c"
      capture_channel_with_bot_function_sid = "ZH211708560ea265161b4ad235d2d99922"
      chatbot_callback_cleanup_function_sid = "ZH269e007928bfa8d3dbd4e7b806d8d690"
      send_message_janitor_function_sid     = "ZHf7c24e583970bf78690354da1986caba"
      bot_language                          = "en-JM"
      widget_from                           = "SafeSpot"
      chat_blocked_message                  = "Sorry, you're not able to contact SafeSpot from this device or account"
      error_message                         = "There has been an error with your message, please try writing us again."
    }



  }
}