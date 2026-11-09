locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = []

  local_config = {

   flow_vars = {
    widget_from                           = "ECPAT"
    chat_blocked_message                  = "Sorry, you're not able to contact ECPAT from this device or account"
  }


   channels = {
    facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
      contact_identity  = "messenger:550013548423077"
      templatefile      = "/app/twilio-iac/helplines/ph/templates/studio-flows/with-lex-chatbot-conv-lambda.tftpl"
      channel_flow_vars = {}
      chatbot_unique_names = []
    }
  }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
    
  }
}