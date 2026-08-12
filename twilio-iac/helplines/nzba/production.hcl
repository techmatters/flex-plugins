locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    enable_external_recordings            = false
    enable_post_survey                    = true
    enable_datadog_monitoring             = false
    custom_task_routing_filter_expression = "channelType IN ['web','voice']  OR isContactlessTask == true"
    permission_config                     = "nzba"

    #Studio flow
    flow_vars = {
      bot_language                      = "en_NZBA"
      widget_from                       = "Barnardos"
      chat_blocked_message              = "Sorry, you're not able to contact Barnardos from this device or account"
      error_message                     = "Something went wrong and your message didn’t send. Please try sending it again."
      send_message_janitor_function_sid = "ZH17d7db67fa6ab6c2a8d8df2bef8fc55e"
    }

    channels = {
      chat : {
        messaging_mode   = "conversations"
        channel_type     = "chat"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nzba/templates/studio-flows/messaging-blocking-preq-conv-lambda-sd.tftpl"
        channel_flow_vars = {
          widget_from                   = "Barnardos"
          chat_blocked_message          = "Sorry, you're not able to contact Barnardos from this device or account"
          send_message_webchat_prequeue = "Kia Ora! We are so pleased you have reached out to talk!  We'll get you connected with one of our counsellors!\nWhile you are waiting for a counsellor, no one can see or read the messages you type. Your conversation will only be visible once a counsellor joins the chat.\n\nWe aim to connect you as quickly as possible but if this is an emergency or you/someone else is in immediate danger, please end this chat and dial 111 immediately.\n\nWhat you share with us is private, and we’ll keep it confidential. Sometimes, if we’re really worried about your safety or someone else’s, we may need to get extra help to keep people safe.  If you want to learn more about how we keep your information safe and how it’s used, you can\nvisit our website at www.whatsup.co.nz"
        }
        chatbot_unique_names = []
      }
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nzba/templates/studio-flows/voice-no-chatbot-operating-hours-blocking-lambda-sd.tftpl"
        channel_flow_vars = {
          play_message_voice_prequeue = "Hello. Please hold on for a while and we will attend to you as soon as we can. Thank you for your patience!."
          play_message_voice_blocked  = "Sorry, you're not able to contact Barnardos from this number"
          voice_ivr_language         = "en-US"
          voice_closed_message_url = "https://nzba-assets-7259.twil.io/After-hours-message.mp3"
          voice_blocked_message_url = "https://nzba-assets-7259.twil.io/Generic-block-message.mp3"
          voice_welcome_message_url = "https://nzba-assets-7259.twil.io/Welcome-Message.mp3"
          voice_risk_question_url = "https://nzba-assets-7259.twil.io/Risk-Check-Question.mp3"
          voice_prequeue_message_url = "https://nzba-assets-7259.twil.io/Queue-waiting-message.mp3"
        }
        chatbot_unique_names = []
      },
    }

    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We’re having some technical problems at the moment, so messages might not go through. We’re working on it and will be back as soon as we can — thanks for your patience."
      voice_message                    = "We’re having some technical problems at the moment, so calls might not go through. We’re working on it and will be back as soon as we can — thanks for your patience."
      send_studio_message_function_sid = "ZHbbf0fb1ec68a5aacc31e8c50415b97bb"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-production-eu.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}
