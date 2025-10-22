/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars = {
      widget_from                               = "Bot"
      operating_hours_function_sid              = "ZH456453b1f869a64ca46e55093189cebd"
      usch_functions_serverless_service_id      = "ZS7ee8b822119953064bc0a47decd20176"
      usch_functions_serverless_environement_id = "ZE763b2058992f785cb2127cc3dca85c05"
      is_skilled_worker_available_function_sid  = "ZH714d91b1f853f0c2404dcbff37c7cb70"
      workspace_sid                             = "WSf1cdfe1d3b5c84379ef10c7064234bd7"
      serverless_usch_functions_url             = "https://usch-functions-7406.twil.io"
      #Common - Webchat
      webchat_blocked_client_message = "We are unable to take your contact at this time. If this is an emergency please contact 911 or 988."
      #Child Help -  Webchat
      childhelp_webchat_other_language_message = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
      childhelp_webchat_welcome_message        = "Thank you for reaching out to our hotline! We will be with you shortly.\nPlease note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp's National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      # Courage First -  Webchat
      courage_first_webchat_other_language_message = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-888-279-1026."
      courage_first_webchat_closed_message         = "Thank you for contacting the Courage First Athlete Helpline. If this is a life-threatening emergency, please contact 911. You have reached us outside of our normal operating hours of Monday through Friday, 12pm to 8pm, PST.   If you would like to chat right now with a Crisis Counselor at the Childhelp National Child Abuse Hotline who can provide immediate emotional support and resources, please call or text 800-422-4453 or visit www.childhelphotline.org "
      courage_first_webchat_welcome_message        = "Please go to the following link for the full terms of service: Terms of Service - The Courage First Athlete Helpline https://www.athletehelpline.org/terms/ "

      #Common - SMS
      sms_blocked_client_message = "We are unable to take your contact at this time. If this is an emergency please contact 911 or 988."
      # Courage First -  SMS
      courage_first_sms_closed_message   = "Thank you for contacting the Courage First Athlete Helpline. If this is a life-threatening emergency, please contact 911."
      courage_first_sms_redirect_message = "You have reached us outside of our normal operating hours of Monday through Friday, 12pm to 8pm, PST. If you would like to text right now with a Crisis Counselor who can provide immediate emotional support and resources, please text 800-422-4453 to reach the Childhelp National Child Abuse Hotline"
      courage_first_sms_welcome_message  = "Thank you for texting the Courage First Athlete Helpline. You'll be connected to a live counselor by SMS. We'll message only to support your conversation (no marketing). Message frequency may vary. Msg&Data rates may apply. Reply STOP to end, HELP for help. Privacy: https://www.athletehelpline.org/terms/. By continuing, you agree to our terms of service."
      courage_first_sms_failure_message  = "We are sorry, we had a technical issue. Please trying texting again or call 1-888-279-1026"
      courage_first_sms_prequeue_message = "Para hablar con un consejero en Español, llame al 800-422-4453. Please note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp's National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      # ChildHelp -  SMS
      childhelp_sms_language_message             = "Thank you for texting the National Child Abuse Hotline. You'll be connected to a live counselor by SMS. We'll message only to support your conversation (no marketing). Message frequency may vary. Msg&Data rates may apply. Reply STOP to end, HELP for help. Privacy: childhelphotline.org/terms-of-service .  For English, reply '1'. For any other language, please reply '2'."
      childhelp_sms_eng_language_message         = "For emergencies contact 911. Standard msg rates may apply. Terms of service can be found here: https://www.childhelphotline.org/terms-of-service . By continuing, you agree to our terms of service. If you cannot access the terms of service, you can also access help by calling the hotline at 800-422-4453."
      childhelp_sms_other_message                = "Currently, our text messaging platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
      childhelp_sms_prequeue_message             = "Please note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp's National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      childhelp_sms_no_response_language_message = "We haven't heard back from you. This conversation will now time out due to inactivity. If you still need support, please reach out again. Crisis counselors are available 24/7. "
      childhelp_sms_failure_message              = "We are sorry, we had a technical issue. Please trying texting again or call 1-800-422-4453"

      #Common - Voice
      voice_blocked_client_message = "We are unable to take your contact at this time. If this is an emergency please contact 911 or 988."
      # Courage First -  Voice
      courage_first_voice_welcome_message            = "Welcome to the Courage First athlete helpline. If this is an emergency hang up and dial 911. For terms of service you can visit athletehelpline.org and click on the terms of service link. You will now be connected to the next Courage First counselor. Calls may be monitored for quality assurance."
      courage_first_voice_redirect_option_message    = "You have reached the courage first athlete helpline outside of normal operating hours. You can press 1 now to speak with a crisis counselor on the childhelp national child abuse hotline or you are welcome to call back during the operating hours of monday through friday 12pm-8pm Pacific standard time."
      courage_first_voice_redirect_childhelp_message = "You will now be transferred to the childhelp national child abuse hotline."
      # ChildHelp -  Voice
      childhelp_voice_welcome_message                       = "You have reached the Childhelp National Child Abuse Hotline."
      childhelp_voice_spanish_option_message                = "Para español presione 2"
      childhelp_voice_english_options_message               = "If this is a life-threatening emergency, hang up and call 911. For terms of service or more information about the hotline, visit childhelphotline.org. Please listen to all options before making a selection. To speak with a crisis counselor, press one.  Please hold for the next available counselor. Calls may be monitored for quality assurance."
      childhelp_voice_prequeue_eng_message                  = "Childhelp National Child Abuse Hotline is dedicated to the prevention of child abuse.  The hotline is staffed 24 hours a day, 7 days a week, with professional crisis counselors. The hotline offers crisis intervention, information, and referrals to thousands of emergency, social service, and support resources.  All calls are confidential. You can also text the hotline at 1800-422-4453 or chat with a counselor at childhelphotline.org. If you are calling to make a report, please contact your local Child Protective Services. You can access our interactive map at childhelp.org for the appropriate number.  Thank you for continuing to hold.  If there is immediate danger, please dial 911. The next available counselor will be with you as soon as possible."
      childhelp_voice_prequeue_spanish_message              = "La Línea Directa Nacional de Abuso Infantil de Childhelp se dedica a la prevención del abuso infantil. La línea directa está abierta las 24 horas del día, los 7 días de la semana, con consejeros profesionales en situaciones de crisis. La línea directa ofrece intervención en situaciones de crisis, información y referencias a miles de recursos de emergencia, servicios sociales y apoyo. Todas las llamadas son confidenciales. Si se trata de una emergencia en donde una vida corre peligro, cuelgue y llame al 911. Las llamadas pueden ser monitoreadas para asegurar la calidad. Si un consejero de habla hispana no está disponible, se le conectará con un consejero que puede acceder a un intérprete. Por favor, espere al próximo consejero disponible."
      childhelp_voice_no_spanish_counselor_prequeue_message = "A Spanish-speaking counselor is not available. Please hold to be connected to an English-speaking counselor engaging an interpreter. Connecting with an interpreter may take a moment. We appreciate your patience."

    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = false
    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/webchat-no-lex-sd.tftpl"
        channel_flow_vars = {
          courage_first_url = "https://www.athletehelpline.org"
          childhelp_url     = "https://www.childhelp"
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
      sms_childhelp_backup : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+18557172986"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-childhelp-lex-sd.tftpl"
        channel_flow_vars = {

        }
        chatbot_unique_names = []
      }
      /*
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
        contact_identity = "+18004224453"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-courage-first-lex-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }*/
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're currently experiencing technical issues, and your message might not be received. If this is an emergency please contact 911 or 988. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      voice_message                    = "We're currently experiencing technical issues, and your call might not be received. If this is an emergency please contact 911 or 988. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      send_studio_message_function_sid = "ZHa3ce185eda1075d9c728ee7832baa8ef"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
  }
}
