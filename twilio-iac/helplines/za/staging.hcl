locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {
    custom_task_routing_filter_expression = ""


    workflow_vars = {
      free_state_messenger_id   = "messenger:108893061823158"
      mpumalanga_messenger_id   = "messenger:104633335590900"
      western_cape_messenger_id = "messenger:111065515147888"
      national_messenger_id     = "messenger:110516273745020"
    }

    #Studio flow
    flow_vars = {
      service_sid                  = "ZS27e84b6573e9e70a6cede7d8b9e5111d"
      environment_sid              = "ZE892b70dd054646bd3abca6f7ccbe4af4"
      operating_hours_function_sid = "ZH38920759a863f804b58a52fd411a3814"
      widget_from                  = "Childline South Africa"
      chat_blocked_message         = "Sorry, you're not able to contact Childline South Africa from this device or account"
    }

    #Channels
    channels = {
      chat : {
        channel_type         = "chat"
        messaging_mode       = "conversations"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook_national : {
        channel_type         = "facebook"
        contact_identity     = "messenger:110516273745020"
        templatefile         = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-national.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook_free_state : {
        channel_type     = "facebook"
        contact_identity = "messenger:108893061823158"
        templatefile     = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-office.tftpl"
        channel_flow_vars = {
          helpline = "Free State"
        }
        chatbot_unique_names = []
      },
      facebook_mpumalanga : {
        channel_type     = "facebook"
        contact_identity = "messenger:104633335590900"
        templatefile     = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-office.tftpl"
        channel_flow_vars = {
          helpline = "Mpumalanga"
        }
        chatbot_unique_names = []
      },
      facebook_western_cape : {
        channel_type     = "facebook"
        contact_identity = "messenger:111065515147888"
        templatefile     = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-office.tftpl"
        channel_flow_vars = {
          helpline = "Western Cape"
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}