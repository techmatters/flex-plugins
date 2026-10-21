locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)



  local_config = {

    custom_task_routing_filter_expression = "channelType == 'web' OR  twilioNumber IN ['messenger:113053900394672', 'messenger:154148147974717', 'messenger:338505126727604']"

    #Studio flow
    flow_vars = {
      widget_from                            = "Tithandizane"
      chat_blocked_message                   = "Sorry, you're not able to contact Tithandizane from this device or account"
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
      facebook : {
        channel_type     = "facebook"
        contact_identity = "messenger:113053900394672"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      ync : {
        channel_type     = "facebook"
        contact_identity = "messenger:154148147974717"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      iwf_mw : {
        channel_type     = "facebook"
        contact_identity = "messenger:338505126727604"
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}