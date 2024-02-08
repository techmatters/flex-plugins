locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Childline Zimbabwe"
    old_dir_prefix                    = "zimbabwe"
    definition_version                = "zw-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-US"
    helpline_language                 = "en-uS"
    voice_ivr_language                = ""
    contacts_waiting_channels         = ["web", "whatsapp", "facebook", "instagram", "voice"]
    enable_post_survey                = false

    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/zw/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "Childline Zimbabwe"
      },
      harare : {
        "target_workers" = "ac_hostname=='196.27.102.1'",
        "friendly_name"  = "Harare"
      },
      bulawayo : {
        "target_workers" = "ac_hostname=='196.27.102.1'",
        "friendly_name"  = "Bulawayo"
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
