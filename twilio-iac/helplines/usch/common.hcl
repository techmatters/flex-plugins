/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "Childhelp"
    task_language              = "en-US"
    enable_post_survey         = false
    enable_external_recordings = false
    permission_config          = "demo"
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile = "/app/twilio-iac/helplines/usch/templates/workflows/master.tftpl"
      },
      //NOTE: MAKE SURE TO ADD THIS IF THE ACCOUNT USES A CONVERSATION CHANNEL
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
        "target_workers" = "routing.skills HAS 'ChildHelp'",
        "friendly_name"  = "ChildHelp"
      },
      courage_first : {
        "target_workers" = "routing.skills HAS 'CourageFirst'",
        "friendly_name"  = "Courage First"
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
    
    
  }
}