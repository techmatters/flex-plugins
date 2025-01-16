locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "ECPAT"
    old_dir_prefix                    = "ecpat"
    definition_version                = "ph-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-PH"
    helpline_language                 = "en-US"
    voice_ivr_language                = ""
    enable_post_survey                = false
    permission_config                 = "ph"


    lex_bot_languages = {
      en_PH : ["pre_survey"],
      fil_PH : ["pre_survey"]
    }


    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile = "/app/twilio-iac/helplines/ph/templates/workflows/master.tftpl"
      },
      queue_transfers : {
        friendly_name = "Queue Transfers Workflow"
        templatefile = "/app/twilio-iac/helplines/templates/workflows/queue-transfers.tftpl"
      },
      survey : {
        friendly_name = "Survey Workflow"
        templatefile = "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "ECPAT"
      },
      non_counselling : {
        "target_workers" = "1==1",
        "friendly_name"  = "Non Counselling"
      },
      outside_operating_hours : {
        "target_workers" = "1==1",
        "friendly_name"  = "Outside Operating Hours"
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


  }
}