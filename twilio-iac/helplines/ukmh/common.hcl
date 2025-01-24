locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)



  local_config = {
    helpline                          = "Mental Health Innovations"
    task_language                     = "en-UK"
    enable_post_survey                = true
    permission_config                 = "ukmh"
    helpline_region                   = "eu-west-1"


    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      },
      queue_transfers = {
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
        "friendly_name"  = "MHI"
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