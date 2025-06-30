locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

 

  local_config = {
    custom_task_routing_filter_expression = ""


    workflow_vars = {
      free_state_messenger_id   = "messenger:351644238276419"
      mpumalanga_messenger_id   = "messenger:771532726302090"
      western_cape_messenger_id = "xxxxxxxxxxxxxxxxxxxxxxxxx"
      national_messenger_id     = "messenger:302611956435114"
    }

    #Studio flow
    flow_vars = {
      service_sid                  = "ZS12b76bbedd5051d075a969d350e2578b"
      environment_sid              = "ZE3efa83672bf9f29818c7f30812735718"
      operating_hours_function_sid = "ZH0bb0bc4e0c498a1dd7b0fd14227d3058"
    }

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-no-chatbot-operating-hours.tftpl"
        channel_flow_vars = {
          chat_greeting_message = "Please hold while we connect you to a counselor"
          widget_from           = "Childline South Africa"
        }
        chatbot_unique_names = []
      },
      facebook_national : {
        channel_type         = "facebook"
        contact_identity     = "messenger:302611956435114"
        templatefile         = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-national.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      facebook_free_state : {
        channel_type     = "facebook"
        contact_identity = "messenger:351644238276419"
        templatefile     = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-office.tftpl"
        channel_flow_vars = {
          helpline = "Free State"
        }
        chatbot_unique_names = []
      },
      facebook_mpumalanga : {
        channel_type     = "facebook"
        contact_identity = "messenger:771532726302090"
        templatefile     = "/app/twilio-iac/helplines/za/templates/studio-flows/messaging-facebook-office.tftpl"
        channel_flow_vars = {
          helpline = "Mpumalanga"
        }
        chatbot_unique_names = []
      }
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-production.tl.techmatters.org/lambda/twilio/account-scoped"

  }
}