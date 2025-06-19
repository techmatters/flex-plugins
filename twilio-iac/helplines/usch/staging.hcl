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
      widget_from                          = "Bot"
      operating_hours_function_sid         = "ZHdf153e322af3839adf83b303cb465846"
      other_language_childhelp_message     = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
      other_language_courage_first_message = "Currently, our chat platform only works in English. For assistance in other languages, please call our hotline at 1-888-279-1026."
      courage_first_closed_message         = "courage_first_closed_message"
      blocked_client_message               = "blocked_client_message"
      childhelp_welcome_message            = "Thank you for reaching out to our hotline! We will be with you shortly.\nPlease note: A false report is a crime governed by federal and state laws, involving a person who, with intent to deceive, knowingly makes a false statement to a mandated reporter or law enforcement official that results in unwarranted government action. Childhelp’s National Child Abuse Hotline is comprised of mandated reporters who will refer malicious or false reports to law enforcement for prosecution."
      couragefirst_welcome_message         = "couragefirst_welcome_message"
      chat_blocked_message = "chat_blocked_message"
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
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, welcome to Childhelp. Please wait for a counsellor."
          voice_ivr_language         = "en-US"
          voice_ivr_blocked_message  = "Apologies, your number has been blocked."

        }
        chatbot_unique_names = []
      },
      sms_childhelp : {
        messaging_mode       = "conversations"
        channel_type         = "sms"
        contact_identity     = "+14809999197"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {
          language_message = "Thank you for texting the National Child Abuse Hotline. For English, press 1.\nFor any other language, please press 2."
          courage_first_other_message = "Currently, our text messaging platform only works in English. For assistance in other languages, please call our hotline at 1-800-422-4453."
          courage_first_eng_language_message = "Thanks for texting. For emergencies contact 911. Standard msg rates may apply. Terms of service can be found here: www.childhelphotline.org/terms-of-service. By continuing, you agree to our terms of service. If you cannot access the terms of service, you can also access help by calling the hotline at 800-422-4453."
        }
        chatbot_unique_names = []
      },
      sms_courage_first : {
        messaging_mode       = "conversations"
        channel_type         = "sms"
        contact_identity     = "+16066032348"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv.tftpl"
        channel_flow_vars    = {
          language_message = "Thank you for texting the Courage Help Hotline. For English, press 1.\nFor any other language, please press 2."
        }
        chatbot_unique_names = []
      }
    }

  }
}