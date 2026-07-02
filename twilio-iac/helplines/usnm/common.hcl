/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "NAMI"
    task_language              = "en-US"
    enable_post_survey         = false
    enable_external_recordings = true
    permission_config          = "demo"
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/usnm/templates/workflows/master.tftpl"
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
    task_channels = {
      default : "Default"
      chat : "Programmable Chat"
      voice : "Voice"
      sms : "SMS"
      video : "Video"
      email : "Email"
      survey : "Survey",
      voicemail : "Voicemail"
    }

    task_queues = {
      master : {
        "target_workers" = "1=0",
        "friendly_name"  = "Master"
      },
      eng_std : {
        "target_workers" = "(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS')",
        "friendly_name"  = "English Standard"
      },
      eng_tya : {
        "target_workers" = "(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS') AND routing.skills HAS 'TYA'",
        "friendly_name"  = "English TYA"
      },
      eng_fcg : {
        "target_workers" = "(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS') AND routing.skills HAS 'FCG'",
        "friendly_name"  = "English FCG"
      },
      es_std : {
        "target_workers" = "(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS') AND routing.skills HAS 'Spanish'",
        "friendly_name"  = "Spanish Standard"
      },
      es_tya : {
        "target_workers" = "(routing.skills HAS 'Calls' OR routing.skills HAS 'SMS') AND routing.skills HAS 'TYA' AND routing.skills HAS 'Spanish'",
        "friendly_name"  = "Spanish TYA"
      },
      en_std_voicemail : {
        "target_workers" = "routing.skills HAS 'Voicemail'",
        "friendly_name"  = "English Standard Voicemail"
      },
      en_tya_voicemail : {
        "target_workers" = "routing.skills HAS 'TYA' AND routing.skills HAS 'Voicemail'",
        "friendly_name"  = "English TYA Voicemail"
      },
      en_fcg_voicemail : {
        "target_workers" = "routing.skills HAS 'FCG' AND routing.skills HAS 'Voicemail'",
        "friendly_name"  = "English FCG Voicemail"
      },
      es_tya_voicemail : {
        "target_workers" = "routing.skills HAS 'FCG' AND routing.skills HAS 'Voicemail' AND routing.skills HAS 'Spanish'",
        "friendly_name"  = "Spanish TYA Voicemail"
      },
      es_std_voicemail : {
        "target_workers" = "routing.skills HAS 'Voicemail' AND routing.skills HAS 'Spanish'",
        "friendly_name"  = "Spanish Standard Voicemail"
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