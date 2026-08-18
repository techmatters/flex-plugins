locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)



  local_config = {
    helpline        = "Barnardos"
    task_language   = "en-NZBA"
    helpline_region = "eu-west-1"

    lex_v2_bot_languages = {
      en_NZBA : ["post_survey"]
    }

    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/nzba/templates/workflows/master.tftpl"
      },
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
        "friendly_name"  = "General Client"
      },
      regular_client : {
        "target_workers" = "1==1",
        "friendly_name"  = "Regular Client"
      },
      high_risk_client : {
        "target_workers" = "1==1",
        "friendly_name"  = "High Risk Client"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey - DO NOT TRANSFER"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
      },
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

    s3_lifecycle_rules = {
      voice_recordings_expiry : {
        id                 = "Voice Recordings Data Expiration Rule"
        expiration_in_days = 365
        prefix             = "voice-recordings/"
      }
    }
  }
}
