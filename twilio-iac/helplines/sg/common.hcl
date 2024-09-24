/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                              = "Tinkle Friend"
    old_dir_prefix                        = ""
    task_language                         = "en-SG"
    enable_post_survey                    = false
    enable_external_recordings            = true
    custom_task_routing_filter_expression = "channelType =='voice' OR channelType =='web' OR isContactlessTask == true"
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile = "/app/twilio-iac/helplines/sg/templates/workflows/master.tftpl"
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
        "friendly_name"  = "Tinkle Friend",
        "max_reserved_workers" = 5
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