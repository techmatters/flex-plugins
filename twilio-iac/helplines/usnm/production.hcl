/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    operating_hours_enforced_override     = true
    custom_task_routing_filter_expression = ""
    flow_vars = {
 
    }

    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    
    studio_flows = {
      post_call_survey : {
        templatefile = "/app/twilio-iac/helplines/usnm/templates/studio-flows/post-call-survey.tftpl"
        flow_vars = {
        }
      },
      post_call_survey_es : {
        templatefile = "/app/twilio-iac/helplines/usnm/templates/studio-flows/post-call-survey-es.tftpl"
        flow_vars = {
        }
      },
      post_call_survey_en : {
        templatefile = "/app/twilio-iac/helplines/usnm/templates/studio-flows/post-call-survey-en.tftpl"
        flow_vars = {

        }
      }
    }
    
    #Channels
    channels = {
    }

    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're sorry, NAMI HelpLine is experiencing technical difficulties and may not be able to respond right now. Your message is important to us and we hope to reconnect soon. If you or your loved one are experiencing a mental health crisis and need urgent support, you can call, chat or text 988 Suicide & Crisis Lifeline. If you are in immediate life threatening danger, call 911. Info and resources are online at https://www.nami.org/nami-helpline/ or you can email helpline@nami.org and we'll respond in 1-2 business days.Thank you for your patience."
      voice_message                    = "We're sorry, NAMI HelpLine is currently experiencing technical difficulties and may not be able to respond right now. Your message is important to us and we hope to reconnect soon. If you or your loved one are experiencing a mental health crisis and need urgent support, please hang up and can call, chat or text 988 Suicide & Crisis Lifeline. If you are in immediate life threatening danger, please hang up and call 911. Info and resources are online at https://www.nami.org/nami-helpline/  or you can email helpline@nami.org and we'll respond in 1-2 business days.Thank you for your patience."
      send_studio_message_function_sid = "ZHbbf0fb1ec68a5aacc31e8c50415b97bb"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-us.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}