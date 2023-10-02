locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {

    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber == 'messenger:103260519220529'"


    flow_vars = {

    }

    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-greeting-message.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Thank you for contacting Childline Zimbabwe, a counsellor will be with you shortly. If this is an emergency or you wait longer than 30 min, we recommend you call us for free at 116."
        }
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:103260519220529"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}