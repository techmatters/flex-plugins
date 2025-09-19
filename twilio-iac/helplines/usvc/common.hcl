/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "NCVC"
    task_language              = "en-US"
    enable_post_survey         = false
    enable_external_recordings = false
    permission_config          = "ncvc"
    enable_lex_v2              = false

    channel_attributes = {
      webchat               = "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl",
      voice                 = "/app/twilio-iac/helplines/templates/channel-attributes/voice.tftpl",
      sms_conversations     = "/app/twilio-iac/helplines/templates/channel-attributes/default-conversations.tftpl",
      default               = "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl",
      default-conversations = "/app/twilio-iac/helplines/templates/channel-attributes/default-conversations.tftpl"
    }
    workflows = {
      master : {
        friendly_name            = "Master Workflow"
        templatefile             = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
        task_reservation_timeout = 30
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
        "friendly_name"  = "VictimConnect"
      },
      dcvh : {
        "target_workers" = "1==1",
        "friendly_name"  = "DC Victim Hotline"
      },
      dc_dispatch : {
        "target_workers" = "1==1",
        "friendly_name"  = "DC Dispatch"
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

    activities = {
    }

    lex_bot_languages = {
    }
    lex_v2_bot_languages = {

    }


  }
}