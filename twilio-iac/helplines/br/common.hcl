locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                          = "SaferNet"
    old_dir_prefix                    = "safernet"
    definition_version                = "br-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "pt-BR"
    helpline_language                 = "pt-BR"
    voice_ivr_language                = ""
    contacts_waiting_channels         = ["facebook", "instagram"]
    enable_post_survey                = false
    permission_config                 = "br"

    lex_bot_languages = {
      pt_br : ["pre_survey", "contact_reason"]
    }
    lex_v2_bot_languages = {
      pt_br : ["contact_reason"]
    }


    workflows = {
      master : {
        friendly_name            = "Master Workflow"
        templatefile             = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
        task_reservation_timeout = 300
      },
      queue_transfers : {
        friendly_name = "Queue Transfers Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/queue-transfers.tftpl"
      },
      survey : {
        friendly_name = "Survey Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "Safernet"
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
