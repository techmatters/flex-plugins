locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                          = "Kék Vonal"
    old_dir_prefix                    = "kek-vonal"
    definition_version                = "hu-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}"
    helpline_language                 = "hu-HU"
    contacts_waiting_channels         = ["web", "voice"]
    enable_post_survey                = false
    helpline_region                   = "eu-west-1"

    lex_bot_languages = {
      uk : ["pre_survey"],
      ru : ["pre_survey"]
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
        "target_workers" = "1==1",
        "friendly_name"  = "Kék Vonal"
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
