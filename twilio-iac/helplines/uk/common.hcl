locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "RevengePorn"
    old_dir_prefix                    = "revengeporn"
    definition_version                = "uk-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-UK"
    helpline_language                 = "en-UK"
    voice_ivr_language                = ""
    contacts_waiting_channels         = ["web", "whatsapp"]
    enable_post_survey                = false




    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/uk/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      master : {
        "target_workers" = "routing.skills HAS 'RP'",
        "friendly_name"  = "Revenge Porn"
      },
      rhc : {
        "target_workers" = "routing.skills HAS 'RHC'",
        "friendly_name"  = "RHC"
      },
      posh : {
        "target_workers" = "routing.skills HAS 'POSH'",
        "friendly_name"  = "POSH"
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