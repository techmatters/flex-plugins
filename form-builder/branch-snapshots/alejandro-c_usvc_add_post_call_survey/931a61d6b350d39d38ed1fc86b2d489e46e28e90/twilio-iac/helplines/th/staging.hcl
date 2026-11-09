locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    operating_hours_enforced_override     = false

    custom_task_routing_filter_expression = "channelType IN ['web','messenger', 'instagram', 'line'] OR  twilioNumber == 'messenger:108893035300837', 'instagram:17841455607284645', 'line:Uac858d9182b0e0fe1fa1b5850ab662bd' OR to=='+6625440477'"


    flow_vars = {
      send_message_janitor_function_sid = "ZHb199d0023a1eb386f78b0ad778e93484"
      widget_from                       = "Childline Thailand"
      chat_blocked_message              = "Sorry, you're not able to contact Childline Thailand from this device or account"

    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        messaging_mode       = "conversations"
        channel_type         = "messenger"
        contact_identity     = "messenger:108893035300837"
        templatefile         = "/app/twilio-iac/helplines/th/templates/studio-flows/facebook-flow-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-blocking-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      line : {
        messaging_mode       = "conversations"
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-custom-channel-blocking-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}
