locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber == 'messenger:131329426738030'"

    #Studio flow
    flow_vars = {
      bot_language = "en"
    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex-v2.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:131329426738030"
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

    # HRM
    case_status_transition_rules = [
      {
        startingStatus : "inProgress",
        targetStatus : "closed",
        timeInStatusInterval : "5 minutes",
        description : "system - 'In Progress' cases are closed after 5 minutes"
      }
    ]
  }
}