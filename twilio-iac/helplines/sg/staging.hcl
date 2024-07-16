/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType =='voice' OR channelType =='web' OR isContactlessTask == true"
    flow_vars = {
      service_sid                   = "ZS8a0d3bbfb230721c2609641ca8e17ce1"
      environment_sid               = "ZEc53cef7898c0b95ee402fb4144e90d1f"
      operating_hours_function_sid  = "ZH6ce19445f0d636acbc4768a52ca91e6f"
      operating_hours_function_name = "operatingHours"
    }

    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Hello! Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can. While waiting, you can check out our BUZZ magazine at https://www.tinklefriend.sg/buzz-magazine/. Thank you for your patience!"
        }
        widget_from = "Tinkle Friend"
        chat_blocked_message = "Hi, you've been blocked from accessing Tinkle Friend services and we are not able to read or receive further messages from you."
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/sg/templates/studio-flows/voice-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          voice_ivr_language         = "en-US",
          voice_ivr_greeting_message = "Hello! Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can."

          welcome_message_url = "https://sg-services-1705.twil.io/welcome_Message.mp3"
          busy_message_url    = "https://sg-services-1705.twil.io/busy_Message.mp3"
          closed_message_url  = "https://sg-services-1705.twil.io/closed_Message.mp3"
        }
        chatbot_unique_names = []
      }
    }
  }
}