locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    #Studio flow
    flow_vars = {
      operating_hours_function_sid          = "xxxx"
      operating_hours_function_name         = "operatingHours"
      capture_channel_with_bot_function_sid = "xxxx"
      chatbot_callback_cleanup_function_sid = "xxxx"
      send_message_run_janitor_sid          = "xxxx"
      bot_language                          = "en-NZ"
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true

    #Task router
    phone_numbers = {
      youthline : ["+999999", "+888888"],
      clinical : ["+7777777"]
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-no-chatbot-operating-hours-flags-routing.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Kia ora, thank you for contacting Youthline. One of our counsellors will get back to you as soon as we can. If you or someone else are in immediate danger, please call 111 immediately."
          blocked_message       = "Kia ora, you've been blocked from accessing Youthline's helpline and we are not able to read or receive further messages from you. If you think this is a mistake, please email complaints@youthline.co.nz with your name and contact details for this to be reviewed. If you are unsafe or require urgent support, please call 111 now."
          widget_from           = "Youthline"
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nz/templates/studio-flows/voice.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Kia ora, thank you for contacting Youthline. One of our counsellors will get back to you as soon as we can. If you or someone else are in immediate danger, please call 111 immediately."
          voice_ivr_language         = "en-US"
          wait_url                   = "https://nz-assets-8961.twil.io/busyLine"
          blocked_url                = "https://nz-assets-8961.twil.io/blocked_number.mp3"
        }
        chatbot_unique_names = []
      },
      modica : {
        channel_type        = "custom"
        contact_identity    = "modica"
        templatefile        = "/app/twilio-iac/helplines/nz/templates/studio-flows/messaging-lex-priority.tftpl"
        channel_flow_vars   = {
          blocked_message     = "Kia ora, you've been blocked from accessing Youthline's helpline and we are not able to read or receive further messages from you. If you think this is a mistake, please email complaints@youthline.co.nz with your name and contact details for this to be reviewed. If you are unsafe or require urgent support, please call 111 now."
        }
        chatbot_unique_names = []
      }
    }
  }
}