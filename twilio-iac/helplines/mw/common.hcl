locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                          = "Tithandizane"
    old_dir_prefix                    = "tithandizane"
    definition_version                = "mw-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en"
    helpline_language                 = "en"
    voice_ivr_language                = ""
    enable_post_survey                = false


    lex_bot_languages = {
      en_MW : ["pre_survey", "youth_testing"]
    }


    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/mw/templates/workflows/master-prod.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      tithandizane : {
        "target_workers" = "1==1",
        "friendly_name"  = "Tithandizane Helpline"
      },
      yoneco : {
        "target_workers" = "1==1",
        "friendly_name"  = "Yoneco"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
      },
      iwf : {
        "target_workers" = "1==1",
        "friendly_name"  = "IWF"
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

  }
}
