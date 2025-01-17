/**
 * Common containse the shared locals for all of a helplines environments
 **/

locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)



  /**
   * The local_config is merged with the defaults_config to create the final common config.
   **/
  local_config = {
    helpline       = "Te Guío"
    old_dir_prefix = "teguio"   
    default_autopilot_chatbot_enabled = false
    task_language                     = "es-CO"
    voice_ivr_language                = "es-MX"
    enable_post_survey                = false
    permission_config                 = "co"
    
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
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
      "friendly_name"  = "Te Guío"
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

     lex_bot_languages = {
      es_CO : ["post_survey"]
    }
  }
}
