locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  twilio_numbers = []

  local_config = {

   
  flow_vars = {
    service_sid                           = "ZS45d1a256ef1c4fa2112f7accc40306c5"
    environment_sid                       = "ZE730f552b9429ca7a2105c822ef7faae4"
    capture_channel_with_bot_function_sid = "ZH520142ac0ba1c7e75bc2a24ab5d8fce6"
    operating_hours_function_sid          = "ZHc6798fb7d700cd812589cf202bb166ca"
  }


   channels = {
    facebook : {
      channel_type      = "facebook"
      contact_identity  = "messenger:106378571968698"
      templatefile      = "/app/twilio-iac/helplines/ph/templates/studio-flows/with-lex-chatbot.tftpl"
      channel_flow_vars = {}
      chatbot_unique_names = []
    }
  }

  }
}