locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Youthline"
    old_dir_prefix                    = ""
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-NZ"
    contacts_waiting_channels         = ["voice", "sms", "web"]

    channel_attributes = {
      webchat : "/app/twilio-iac/helplines/nz/templates/channel-attributes/webchat.tftpl"
      voice   : "/app/twilio-iac/helplines/nz/templates/channel-attributes/voice.tftpl"
      modica  : "/app/twilio-iac/helplines/nz/templates/channel-attributes/modica.tftpl",
      default : "/app/twilio-iac/helplines/templates/channel-attributes/default.tftpl",
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
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      youthline_helpline : {
        "target_workers" = "routing.skills HAS 'Youthline Helpline'",
        "friendly_name"  = "Youthline Helpline"
      },
      priority : {
        "target_workers" = "routing.skills HAS 'Priority'",
        "friendly_name"  = "Priority Youthline Helpline"
      },
      clinical : {
        "target_workers" = "routing.skills HAS 'Clinical'",
        "friendly_name"  = "Clinical"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey - DO NOT TRANSFER"
      }
    }

    lex_bot_languages = {
      en_NZ : ["pre_survey"]
    }

    # HRM
    case_status_transition_rules = [
      {
        startingStatus : "submitted",
        targetStatus : "closed",
        timeInStatusInterval : "28 days",
        description : "rule to close submitted cases after 28 days"
      }
    ]

  }
}
