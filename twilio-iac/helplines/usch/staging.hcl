/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars = {
      widget_from                                  = "Bot"
      operating_hours_function_sid                 = "ZHdf153e322af3839adf83b303cb465846"
      usch_functions_serverless_service_id         = "ZSa6dafc8e097453d9b5041e4a3123525c"
      usch_functions_serverless_environement_id    = "ZEbcc21f22160cba1e3fdb1bff6ae24295"
      is_skilled_worker_available_function_sid     = "ZHa1e94f59f90924f9e2ab41714d848471"
      worspace_sid                                 = "WS3320dfd12f64cb39784075ef93c8babf"
      childhelp_webchat_other_language_message             = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
      childhelp_webchat_welcome_message                    = "Thank you for reaching out to our hotline! We will be with you shortly.\nPlease note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp's National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      

      courage_first_webchat_other_language_message         = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-888-279-1026."
      courage_first_webchat_closed_message                 = "Thank you for contacting the Courage First Athlete Helpline. If this is a life-threatening emergency, please contact 911. You have reached us outside of our normal operating hours of Monday through Friday, 12pm to 8pm, PST.   If you would like to chat right now with a Crisis Counselor at the Childhelp National Child Abuse Hotline who can provide immediate emotional support and resources, please call or text 800-422-4453 or visit www.childhelphotline.org "
      courage_first_webchat_welcome_message                 = "Please go to the following link for the full terms of service: Terms of Service - The Courage First Athlete Helpline https://www.athletehelpline.org/terms/ "
      
      webchat_blocked_client_message                       = "blocked_client_message"
      
      
      chat_blocked_message                         = "chat_blocked_message"
      serverless_usch_functions_url                = "https://usch-functions-6913.twil.io"
      childhelp_welcome_voice_message              = "You have reached the Childhelp National Child Abuse Hotline."
      courage_first_welcome_voice_message           = "Welcome to the Courage First athlete helpline. If this is an emergency hang up and dial 911. For terms of service you can visit athletehelpline.org and click on the terms of service link. You will now be connected to the next Courage First counselor. Calls may be monitored for quality assurance."
      courage_first_prequeue_eng_message            = "Thank you, a counselor will be with you shortly. Para hablar con un consejero en Español, llame al 800-422-4453. Please note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp’s National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      spanish_option_voice_message                 = "Para español presione 2"
      no_spanish_counselor_prequeue_voice_message  = "no spanish counselor prequeue voice message"
      english_options_voice_message                = "If this is a life-threatening emergency, hang up and call 911. For terms of service or more information about the hotline, visit childhelphotline.org. Please listen to all options before making a selection. To speak with a crisis counselor, press one.  Please hold for the next available counselor. Calls may be monitored for quality assurance."
      childhelp_prequeue_spanish_voice_message     = "La Línea Directa Nacional de Abuso Infantil de Childhelp se dedica a la prevención del abuso infantil. La línea directa está abierta las 24 horas del día, los 7 días de la semana, con consejeros profesionales en situaciones de crisis. La línea directa ofrece intervención en situaciones de crisis, información y referencias a miles de recursos de emergencia, servicios sociales y apoyo. Todas las llamadas son confidenciales. Si se trata de una emergencia en donde una vida corre peligro, cuelgue y llame al 911. Las llamadas pueden ser monitoreadas para asegurar la calidad. Si un consejero de habla hispana no está disponible, se le conectará con un consejero que puede acceder a un intérprete. Por favor, espere al próximo consejero disponible."
      childhelp_prequeue_english_voice_message     = "Childhelp National Child Abuse Hotline is dedicated to the prevention of child abuse.  The hotline is staffed 24 hours a day, 7 days a week, with professional crisis counselors. The hotline offers crisis intervention, information, and referrals to thousands of emergency, social service, and support resources.  All calls are confidential. You can also text the hotline at 1800-422-4453 or chat with a counselor at childhelphotline.org. If you are calling to make a report, please contact your local Child Protective Services. You can access our interactive map at childhelp.org for the appropriate number.  Thank you for continuing to hold.  If there is immediate danger, please dial 911. The next available counselor will be with you as soon as possible."
      childhelp_prequeue_spanish_voice_message = "This will be the pre queue spanish message"
      childhelp_prequeue_english_voice_message = "This will be the pre queue english message"
      courage_first_prequeue_spanish_voice_message = "This will be the pre queue spanish message"
      courage_first_prequeue_english_voice_message = "This will be the pre queue english message"
      redirect_childhelp_voice_message             = "redirect childhelp message"
      system_error_eng_language_message             = "Sorry, there was a system error. Please try contacting us again."
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/webchat-no-chatbot.tftpl"
        channel_flow_vars = {
          courage_first_url = "https://assets-staging.tl.techmatters.org/webchat/usch/usch_courage_first.html"
          childhelp_url     = "https://assets-staging.tl.techmatters.org/webchat/usch/usch_childhelp_hotline.html"
        }
        chatbot_unique_names = []
      },
      voice_childhelp : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/voice-childhelp.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice_courage_first : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/voice-courage-first-no-operating-hours.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      sms_childhelp : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+14809999197"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-childhelp-chatbot.tftpl"
        channel_flow_vars = {
          language_message               = "Thank you for texting the National Child Abuse Hotline. For English, press 1.\nFor any other language, please press 2."
          childhelp_other_message        = "Currently, our text messaging platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
          childhelp_eng_language_message = "Thanks for texting. For emergencies contact 911. Standard msg rates may apply. Terms of service can be found here: https://www.childhelphotline.org/terms-of-service . By continuing, you agree to our terms of service. If you cannot access the terms of service, you can also access help by calling the hotline at 800-422-4453."
        }
        chatbot_unique_names = []
      },
      sms_courage_first : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+16066032348"
        templatefile     = "/app/twilio-iac/helplines/usch/templates/studio-flows/sms-courage-first-chatbot.tftpl"
        channel_flow_vars = {
          //language_message                   = "Thank you for texting the Courage Help Hotline. For English, press 1.\nFor any other language, please press 2."
          //courage_first_other_message        = "Currently, our text messaging platform only works in English. For assistance in other languages, please call our hotline at 1-888-279-1026."
          courage_first_eng_language_message = "Thank you for texting the Courage First Athlete Helpline. Standard msg rates may apply. Terms of service can be found at https://www.athletehelpline.org/terms/. By continuing, you agree to our terms of service."
        }
        chatbot_unique_names = []
      }
    }
  get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}