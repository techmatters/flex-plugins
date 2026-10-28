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
      usch_functions_serverless_service_id      = "ZSa6dafc8e097453d9b5041e4a3123525c"
      usch_functions_serverless_environement_id = "ZEbcc21f22160cba1e3fdb1bff6ae24295"
      is_skilled_worker_available_function_sid  = "ZHa1e94f59f90924f9e2ab41714d848471"
      workspace_sid                             = "WS3320dfd12f64cb39784075ef93c8babf"
      serverless_usch_functions_url             = "https://usch-functions-6913.twil.io"
      #Common - Webchat
      webchat_blocked_client_message = "We are unable to take your contact at this time. If this is an emergency please contact 911 or 988."
      #Child Help -  Webchat
      childhelp_webchat_other_language_message = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
      childhelp_webchat_welcome_message        = "Thank you for reaching out to our hotline! We will be with you shortly.\nPlease note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp's National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution.  If this is a life-threatening emergency please contact 911."
      # Courage First -  Webchat
      courage_first_webchat_other_language_message = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-888-279-1026."
      courage_first_webchat_welcome_message        = "Please go to the following link for the full terms of service: Terms of Service - The Courage First Athlete Helpline https://www.athletehelpline.org/terms/ We will be with you shortly.\nPlease note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. The Courage First Athlete Helpline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution.  If this is a life-threatening emergency please contact 911."

      #Common - SMS
      sms_blocked_client_message = "We are unable to take your contact at this time. If this is an emergency please contact 911 or 988."
      # Courage First -  SMS
      courage_first_sms_welcome_message  = "Thank you for texting the Courage First Athlete Helpline. You'll be connected to a live counselor by SMS. We'll message only to support your conversation (no marketing). Message frequency may vary. Msg&Data rates may apply. Reply STOP to end, HELP for help. Privacy: https://www.athletehelpline.org/terms/. By continuing, you agree to our terms of service."
      courage_first_sms_failure_message  = "We are sorry, we had a technical issue. Please trying texting again or call 1-888-279-1026"
      courage_first_sms_prequeue_message = "Para hablar con un consejero en Español, llame al 800-422-4453. Please note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action.  Courage First Athlete Helpline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      # ChildHelp -  SMS
      childhelp_sms_language_message             = "Thank you for texting the National Child Abuse Hotline. You'll be connected to a live counselor by SMS. We'll message only to support your conversation (no marketing). Message frequency may vary. Msg&Data rates may apply. Reply STOP to end, HELP for help. Privacy: childhelphotline.org/terms-of-service . For English, reply '1'. For any other language, please reply '2'."
      childhelp_sms_eng_language_message         = "By continuing, you agree to our terms of service. If you cannot access the terms of service, you can also access help by calling the hotline at 800-422-4453."
      childhelp_sms_other_message                = "Currently, our text messaging platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
      childhelp_sms_prequeue_message             = "Please note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp's National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      childhelp_sms_no_response_language_message = "We haven't heard back from you. This conversation will now time out due to inactivity. If you still need support, please reach out again. Crisis counselors are available 24/7. "
      childhelp_sms_failure_message              = "We are sorry, we had a technical issue. Please trying texting again or call 1-800-422-4453"

      #Common - Voice
      # Courage First -  Voice
      # ChildHelp -  Voice

    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    #Channels
    channels = {
      chat : {
        messaging_mode   = "conversations"
        channel_type     = "chat"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/webchat-no-lex-conv-sd.tftpl"
        channel_flow_vars = {
          courage_first_url = "https://assets-staging.tl.techmatters.org/aselo-webchat-react-app/usch/usch_courage_first.html"
          childhelp_url     = "https://assets-staging.tl.techmatters.org/aselo-webchat-react-app/usch/usch_childhelp_hotline.html"
        }
        chatbot_unique_names = []
      },
      voice_childhelp : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/voice-childhelp-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice_courage_first : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/voice-courage-first-op-hours-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      sms_childhelp : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+14809999197"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-childhelp-lex-sd.tftpl"
        channel_flow_vars = {

        }
        chatbot_unique_names = []
      },
      sms_courage_first : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+16066032348"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-courage-first-lex-sd.tftpl"
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
      message                          = "We're currently experiencing technical issues, and your message might not be received. If this is an emergency please contact 911 or 988. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      voice_message                    = "We're currently experiencing technical issues, and your call might not be received. If this is an emergency please contact 911 or 988. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      send_studio_message_function_sid = "ZHda5f23152bb1a843c303049674007b87"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    hrm_transcript_retention_days_override = 7
 }
}
