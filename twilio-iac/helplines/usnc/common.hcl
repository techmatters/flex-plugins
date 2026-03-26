locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)



  local_config = {
    helpline        = "Promise Resource Network"
    task_language   = "en-US"

    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/usnc/templates/workflows/master.tftpl"
        task_reservation_timeout = 20
      },
      webchat_sms : {
        friendly_name = "Webchat SMS Workflow"
        templatefile  = "/app/twilio-iac/helplines/usnc/templates/workflows/webchat-sms.tftpl"
        task_reservation_timeout = 20
      },
      queue_transfers : {
        friendly_name = "Queue Transfers Workflow"
        templatefile  = "/app/twilio-iac/helplines/usnc/templates/workflows/queue-transfers.tftpl"
      },
      survey : {
        friendly_name = "Survey Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "Warm Line"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
      },
      switchboard : {
        "target_workers" = "roles HAS 'supervisor'",
        "friendly_name"  = "Switchboard Queue"
      }
    }
    lex_v2_bot_languages = {
      en_USNC : ["pre_survey", "post_survey"]
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
    activities = {
      scheduled_break : {
        friendly_name = "Scheduled Break"
        available     = false
      },
      unscheduled_break : {
        friendly_name = "Unscheduled Break"
        available     = false
      },
      meal_break : {
        friendly_name = "Meal Break"
        available     = false
      },
      refused : {
        friendly_name = "Refused"
        available     = false
      },
      meeting : {
        friendly_name = "Meeting"
        available     = false
      },
      documentation : {
        friendly_name = "Documentation"
        available     = false
      },
      training : {
        friendly_name = "Training"
        available     = false
      },
      leadership : {
        friendly_name = "Leadership Admin Tasks"
        available     = false
      },
      supervision : {
        friendly_name = "Supervision"
        available     = false
      }
    }

  }
}