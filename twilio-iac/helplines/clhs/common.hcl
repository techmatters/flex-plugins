/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "Hora Segura"
    task_language              = "es-CL"
    enable_post_survey         = true
    enable_external_recordings = false
    permission_config          = "clhs"
    helpline_region            = "us-east-1"
    enable_lex_v2                     = true
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      },
      //NOTE: MAKE SURE TO ADD THIS IF THE ACCOUNT USES A CONVERSATION CHANNEL
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
        "friendly_name"  = "Atención"
      },
      priority : {
        "target_workers" = "routing.skills HAS 'Prioridad'",
        "friendly_name"  = "Contactos Urgentes"
      }
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
      }
    }

    lex_v2_bot_languages = {
      es_CLHS : ["post_survey"]
    }
  }
}