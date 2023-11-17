locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                          = "End to End Testing"
    old_dir_prefix                    = "e2e"
    definition_version                = "e2e-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-US"
    helpline_language                 = "en"
    voice_ivr_language                = ""
    enable_post_survey                = false
    task_language                     = "en-US"


    lex_bot_languages = {
      en : ["pre_survey"]
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
      master : {
        "target_workers" = "helpline IN ['Childline', ''] AND routing.skills HAS 'automated-test'",
        "friendly_name"  = "Childline"
      },
      childline_human : {
        "target_workers" = "1==0",
        "friendly_name"  = "Childline-Human"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
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
