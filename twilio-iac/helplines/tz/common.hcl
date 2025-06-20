locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)



  local_config = {
    helpline           = "C-Sema"
    task_language      = "en-US"
    enable_post_survey = false
    permission_config  = "tz"

    channel_attributes = {
      webchat : "/app/twilio-iac/helplines/templates/channel-attributes/webchat.tftpl"
      voice : "/app/twilio-iac/helplines/templates/channel-attributes/voice.tftpl"
      default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl"
      default-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/default-conversations.tftpl"
      line-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/custom-channel-conversations.tftpl"
      telegram-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/custom-channel-conversations.tftpl"
      instagram-conversations : "/app/twilio-iac/helplines/templates/channel-attributes/custom-channel-conversations.tftpl"
      facebook_mainland-conversations: "/app/twilio-iac/helplines/tz/templates/channel-attributes/facebook_mainland-conversations.tftpl"
      facebook_zanzibar-conversations: "/app/twilio-iac/helplines/tz/templates/channel-attributes/facebook_zanzibar-conversations.tftpl"
    }


    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/tz/templates/workflows/master.tftpl"
      },
      queue_transfers = {
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
        "friendly_name"  = "Mainland"
      },
      zanzibar : {
        "target_workers" = "1==1",
        "friendly_name"  = "Zanzibar"
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

    lex_bot_languages = {
      en_US : ["pre_survey", "language_selector"],
      sw_TZ : ["pre_survey"]
    }
  }
}