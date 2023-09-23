locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Ecpat"
    old_dir_prefix                    = "ecpat"
    definition_version                = "ph-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-PH"
    helpline_language                 = "en-US"
    voice_ivr_language                = ""
    enable_post_survey                = false


    lex_bot_languages = {
      en_PH : ["pre_survey"],
      fil_PH : ["pre_survey"]
    }


    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      messaging : {
        "target_workers" = "1==1",
        "friendly_name"  = "Messaging"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      }
    }
    task_channels = {
      default : "Default"
      chat : "Programmable Chat"
      voice : "Voice"
      sms : "SMS"
      video : "Video"
      email : "Email"
      survey : "Survey"
    }



    phone_numbers = {}
  }
}