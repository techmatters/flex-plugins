locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                   = "Youthline"
    task_language              = "en-NZ"
    enable_external_recordings = true

    channel_attributes = {
      webchat : "/app/twilio-iac/helplines/nz/templates/channel-attributes/webchat.tftpl",
      voice   : "/app/twilio-iac/helplines/nz/templates/channel-attributes/voice.tftpl",
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
        "target_workers" = "(roles HAS 'agent' OR roles HAS 'supervisor') AND email NOT IN ['emmac@youthline.co.nz','ashleigh@youthline.co.nz','tonys@youthline.co.nz']",
        "friendly_name"  = "Youthline Helpline"
      },
      priority : {
        "target_workers" = "(roles HAS 'agent' OR roles HAS 'supervisor') AND email NOT IN ['emmac@youthline.co.nz','ashleigh@youthline.co.nz','tonys@youthline.co.nz']",
        "friendly_name"  = "Priority Youthline Helpline"
      },
      clinical : {
        "target_workers" = "(routing.skills HAS 'Clinical') AND email NOT IN ['emmac@youthline.co.nz','ashleigh@youthline.co.nz','tonys@youthline.co.nz']",
        "friendly_name"  = "Clinical"
      },
      counselling : {
        "target_workers" = "((roles HAS 'agent' OR roles HAS 'supervisor') AND email IN ['emmac@youthline.co.nz','ashleigh@youthline.co.nz','tonys@youthline.co.nz']) OR (roles HAS 'supervisor' AND routing.skills HAS 'YL Other Services')",
        "friendly_name"  = "YL Other Services"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey - DO NOT TRANSFER"
      }
    }

    lex_bot_languages = {
      en_NZ : ["pre_survey"]
    }


  }
}
