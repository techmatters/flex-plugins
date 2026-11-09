/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = { custom_task_routing_filter_expression = "channelType IN ['web'] OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
      widget_from                               = "PCAVT"
      chat_blocked_message                      = "Hi, you've been blocked from accessing our services and we are not able to read or receive further messages from you."
      bot_language                              = "en"
      send_message_janitor_function_sid         = "ZH10171c61b82a492f4cf008622e1d9f34"
      error_message                             = "There has been an error with your message, please try writing us again."
      menu_option_message_report_abuse          = "If you or someone else is in immediate danger, please call 911. If you are concerned about the safety or well-being of a child and would like to make a report of child abuse or neglect, you can call 1-800-649-5285. The line is available 24 hours a day, 7 days a week."
      menu_option_message_talk_to_someone       = "If you would like to talk with someone you can text this number XXX-XXX-XXXX or call XXX-XXX-XXXX."
      menu_option_message_parent_education      = "We are glad you are interested in learning more about our programs. You can choose the option that feels most helpful to you: to view upcoming programs, click here. To enroll in a program, click here. To refer a family, click here. If you have a specific question or would prefer to speak with someone, please email familysupport@pcavt.org. We are happy to help you find the information or support that is right for you."
      menu_option_message_csa_prevention        = "Interested in learning more about Train the Trainer opportunities? You can click here to view upcoming events and find additional information."
      menu_option_message_healthy_relationships = "Looking for Healthy Relationships Project resources or curriculum? To purchase curriculum, click on the link here. To contact the HRP team, please email hrpteam@pcavt.org."
      menu_option_message_adult_responsibility  = "You can explore the Adult Responsibilities Training Calendar and choose the training opportunity that works best for you here: click here."
      menu_option_message_volunteer_apply       = "Thank you for your interest in volunteering with us. We welcome you to learn more and apply when you are ready, click here. If you have questions about volunteering or would like more information before applying, please reach out to our team at pcavt@pcavt.org."
    }

    channels = {
      chat : {
        channel_type     = "chat"
        messaging_mode   = "conversations"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvt/templates/studio-flows/messaging-lex-v3-blocking-lambda-sd.tftpl"
        channel_flow_vars = {
          widget_from                   = "PCAVT"
          chat_blocked_message          = "Sorry, you're not able to contact Barnardos from this device or account"
          send_message_webchat_prequeue = "Hello. Please hold on for a while and we will attend to you as soon as we can. Thank you for your patience!. If you are in immediate danger, please call the Police at 911."
        }
        chatbot_unique_names = []
      }
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
    get_profile_flags_for_identifier_base_url = "https://hrm-staging-us.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}