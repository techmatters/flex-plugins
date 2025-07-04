/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    helpline_region = "eu-west-1"

    custom_task_routing_filter_expression = ""
    flow_vars = {
      service_sid                   = "ZSbfebd43b19b4db9e3bd763b72b101eaf"
      environment_sid               = "ZE12ad6d59ba95d24d43e184a21cfe3669"
      operating_hours_function_sid  = "ZH95bf7c7442969d4577caa5b656957f53"
      operating_hours_function_name = "operatingHours"
    }

    //Serverless -- to allow enabling the operating hours check on this account.
    ui_editable = true

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours-blocking.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Hello, Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can. Thank you for your patience!.\nWhile waiting, you can check out our BUZZ magazine at http://www.tinklefriend.sg/buzz-magazine/. Alternatively, you can email us at tinklefriend@childrensociety.org.sg and we will respond to you in 3 working days.\nIf you are experiencing mental health issues and need immediate support please call National Mindline 1771. In the event that you are facing a crisis and thinking about suicide, you can Whatsapp our friends from Samaritans of Singapore (SOS) at 9151 1767. If you are in immediate danger, please call the Police at 999."
          widget_from           = "Tinkle Friend"
          chat_blocked_message  = "Hello, Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can. Thank you for your patience!.\nWhile waiting, you can check out our BUZZ magazine at http://www.tinklefriend.sg/buzz-magazine/. Alternatively, you can email us at tinklefriend@childrensociety.org.sg and we will respond to you in 3 working days.\nIf you are experiencing mental health issues and need immediate support please call National Mindline 1771. In the event that you are facing a crisis and thinking about suicide, you can Whatsapp our friends from Samaritans of Singapore (SOS) at 9151 1767. If you are in immediate danger, please call the Police at 999."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/sg/templates/studio-flows/voice-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          voice_ivr_language         = "en-US",
          voice_ivr_greeting_message = "Hello! Tinkle Friend is engaged with other children at the moment. Please hold on for a while and we will attend to you as soon as we can."

          welcome_message_url = "https://sg-services-4304.twil.io/welcome_Message.mp3"
          busy_message_url    = "https://sg-services-4304.twil.io/waiting_music.mp3"
          closed_message_url  = "https://sg-services-4304.twil.io/closed_Message.mp3"
          
          widget_from           = "Tinkle Friend"
          voice_ivr_blocked_message  = "Hi, you've been blocked from accessing Tinkle Friend services and we are not able to read or receive further messages from you."
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production-eu.tl.techmatters.org/lambda/twilio/account-scoped"
  }

}
