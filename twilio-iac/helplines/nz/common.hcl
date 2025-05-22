locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                   = "Youthline"
    task_language              = "en-NZ"
    enable_external_recordings = true
    enable_datadog_monitoring  = false
    permission_config          = "nz"
    enable_lex_v2                         = false

    channel_attributes = {
      webchat                 = "/app/twilio-iac/helplines/nz/templates/channel-attributes/webchat.tftpl",
      voice                   = "/app/twilio-iac/helplines/nz/templates/channel-attributes/voice.tftpl",
      modica                  = "/app/twilio-iac/helplines/nz/templates/channel-attributes/modica.tftpl",
      modica-conversations    = "/app/twilio-iac/helplines/nz/templates/channel-attributes/custom-conversations.tftpl",
      instagram-conversations = "/app/twilio-iac/helplines/nz/templates/channel-attributes/custom-conversations.tftpl",
      whatsapp-conversations  = "/app/twilio-iac/helplines/nz/templates/channel-attributes/whatsapp-conversations.tftpl",
      default                 = "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl",
      default-conversations   = "/app/twilio-iac/helplines/templates/channel-attributes/default-conversations.tftpl"
    }
    workflows = {
      master : {
        friendly_name            = "Master Workflow - Messaging"
        templatefile             = "/app/twilio-iac/helplines/nz/templates/workflows/master_messaging.tftpl",
        task_reservation_timeout = 120
      },
      master_calls : {
        friendly_name            = "Master Workflow - Calls"
        templatefile             = "/app/twilio-iac/helplines/nz/templates/workflows/master_calls.tftpl",
        task_reservation_timeout = 30
      },
      queue_transfers : {
        friendly_name = "Queue Transfers Workflow"
        templatefile  = "/app/twilio-iac/helplines/nz/templates/workflows/queue-transfers.tftpl"
      },
      survey : {
        friendly_name = "Survey Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      youthline_helpline : {
        "target_workers" = "(roles HAS 'agent' OR roles HAS 'supervisor')",
        "friendly_name"  = "Youthline Helpline"
      },
      priority : {
        "target_workers" = "(roles HAS 'agent' OR roles HAS 'supervisor')",
        "friendly_name"  = "Priority Youthline Helpline"
      },
      clinical : {
        "target_workers" = "(routing.skills HAS 'Clinical')",
        "friendly_name"  = "Clinical"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey - DO NOT TRANSFER"
      }
    }

    lex_bot_languages = {
      en_NZ : ["pre_survey", "pre_survey_ig", "counsel_check"]
    }
    lex_v2_bot_languages = {}

  }
}
