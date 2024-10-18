locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_datadog_monitoring             = true
    custom_task_routing_filter_expression = "channelType IN ['web','instagram','line']  OR isContactlessTask == true OR  twilioNumber IN ['messenger:59591583805', 'twitter:1154628838472597505', 'instagram:59591583805', 'line:U65333e6b8ca9e96e41252ecb27c44cf9']"


    flow_vars = {
      service_sid                       = "ZS6afa8bf5e4d982ddeab17b7e0dba9977"
      environment_sid                   = "ZE9c5728dc8ad714c6c26ba90fddf41bc1"
      operating_hours_function_sid      = "ZH5147ef61e945cf01b85804663b481a58"
      send_message_janitor_function_sid = "ZHaecc65b08bab5873b10946e336f7098c"
      widget_from                       = "Childline Thailand"
      chat_blocked_message              = "Sorry, you're not able to contact Childline Thailand from this device or account"

    }

    channels = {
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:59591583805"
        templatefile         = "/app/twilio-iac/helplines/th/templates/studio-flows/facebook-flow.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      line : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-blocking-conv.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_1d):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=WEEKLY;INTERVAL=1;BYHOUR=23;BYMINUTE=0;BYDAY=MO,TU,WE,TH,FR,SA,SU"
            timezone = "Asia/Bangkok"
          }
        }

      }
    }


  }
}