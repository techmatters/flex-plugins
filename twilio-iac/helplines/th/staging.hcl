locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)


  local_config = {

    custom_task_routing_filter_expression = "channelType =='web'  OR isContactlessTask == true OR  twilioNumber IN ['messenger:108893035300837', 'instagram:17841455607284645', 'line:Uac858d9182b0e0fe1fa1b5850ab662bd'] OR to=='+6625440477'"


    flow_vars = {
      service_sid                  = "ZS54d8a38f0dc4e4fac7304ee21f2b871e"
      environment_sid              = "ZEc5d32f29ead0d580a4d474101ce44f28"
      operating_hours_function_sid = "ZH7ebc05f97f15c319d0df431843040fd2"

    }

    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook : {
        channel_type         = "facebook"
        contact_identity     = "messenger:108893035300837"
        templatefile         = "/app/twilio-iac/helplines/th/templates/studio-flows/facebook-flow.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      instagram : {
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      line : {
        channel_type         = "custom"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

  }
}
