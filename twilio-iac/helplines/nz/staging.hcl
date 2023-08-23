locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

    custom_task_routing_filter_expression = "to IN ['+18645238101','+6478079100'] OR channelType =='web'  OR isContactlessTask == true"

    #Studio flow
    flow_vars = {
      service_sid                   = "ZSe8d4ba646d0eafbb6de85e2d96e473f7"
      environment_sid               = "ZE6945a088f73c41632345fd0aae8df17b"
      operating_hours_function_sid  = "ZH3ef7c7c03c4533829cc1b53b38197de7"
      operating_hours_function_name = "operatingHours"
    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true

    #Task router
    phone_numbers = {
      youthline : ["+18645238101", "+6478079100"]
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Kia ora, thank you for contacting Youthline. One of our counsellors will back to you as soon as we can. If you or someone else are in immediate danger, please call 111 immediately."
          widget_from           = "Youthline"
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/nz/templates/studio-flows/voice.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Kia ora, thank you for contacting Youthline. One of our counsellors will back to you as soon as we can. If you or someone else are in immediate danger, please call 111 immediately."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
      sms : {
        channel_type         = "sms"
        contact_identity     = "+18645238101"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/sms-basic.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
  }
}