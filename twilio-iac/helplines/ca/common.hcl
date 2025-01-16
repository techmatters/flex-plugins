locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Kids Help Phone"
    old_dir_prefix                    = "kidshelpphone"
    default_autopilot_chatbot_enabled = false
    task_language                     = "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}"
    enable_external_recordings        = true
    contacts_waiting_channels         = ["voice", "web"]
    permission_config                 = "ca"
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/ca/templates/workflows/master.tftpl"
      }
    }

    task_queues = {
      aggregate : {
        "target_workers" = "1==1",
        "friendly_name"  = "Aggregate"
      },
      khp_en : {
        "target_workers" = "routing.skills HAS 'KHP English'",
        "friendly_name"  = "KHP English"
      },
      khp_fr : { "target_workers" = "routing.skills HAS 'KHP French'",
        "friendly_name"           = "KHP French"
      },
      ab211_en : {
        "target_workers" = "routing.skills HAS 'AB211En'",
        "friendly_name"  = "AB211 English"
      },
      ab211_fr : {
        "target_workers" = "routing.skills HAS 'AB211Fr'",
        "friendly_name"  = "AB211 French"
      },
      g2t_ns_en : {
        "target_workers" = "routing.skills HAS 'G2TNSEn'",
        "friendly_name"  = "Good2Talk NS English"
      },
      g2t_ns_fr : {
        "target_workers" = "routing.skills HAS 'G2TNSFr'",
        "friendly_name"  = "Good2Talk NS French"
      },
      g2t_on_en : {
        "target_workers" = "routing.skills HAS 'G2TONEn'",
        "friendly_name"  = "Good2Talk ON English"
      },
      g2t_on_fr : {
        "target_workers" = "routing.skills HAS 'G2TONFr'",
        "friendly_name"  = "Good2Talk ON French"
      },
      g2t_int : {
        "target_workers" = "routing.skills HAS 'G2TONTr'",
        "friendly_name"  = "Good2Talk Interpreter"
      },
      interpreter_en : {
        "target_workers" = "routing.skills HAS 'KHP Interpreter' ",
        "friendly_name"  = "KHP Interpreter"
      },
      interpreter_fr : {
        "target_workers" = "routing.skills HAS 'French Interpreter' ",
        "friendly_name"  = "French Interpreter"
      },
      supervisor : {
        "target_workers" = "routing.skills HAS 'Supervisor'",
        "friendly_name"  = "Supervisor"
      },
      training : {
        "target_workers" = "routing.skills HAS 'Training'",
        "friendly_name"  = "Training"
      },
      chat_en : {
        "target_workers" = "routing.skills HAS 'Chat English'",
        "friendly_name"  = "Chat English"
      },
      chat_fr : {
        "target_workers" = "routing.skills HAS 'Chat French'",
        "friendly_name"  = "Chat French"
      },
      indigenous : {
        "target_workers" = "routing.skills HAS 'Indigenous/Interpreter'",
        "friendly_name"  = "Indigenous/Interpreter"
      },
      "988_en" : {
        "target_workers" = "routing.skills HAS '988En'",
        "friendly_name"  = "988 English"
      },
      "988_fr" : {
        "target_workers" = "routing.skills HAS '988Fr'",
        "friendly_name"  = "988 French"
      },
      "988_ns_fr" : {
        "target_workers" = "routing.skills HAS '988NSFr'",
        "friendly_name"  = "988 NS French"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
      }
    }
    s3_lifecycle_rules = {
      hrm_export_expiry : {
        id                 = "HRM Exported Data Expiration Rule"
        expiration_in_days = 30
        prefix             = "hrm-data/"
      },
      transcripts_expiry : {
        id                 = "Transcripts Data Expiration Rule"
        expiration_in_days = 90
        prefix             = "transcripts/"
      },
      voice_recordings_expiry : {
        id                 = "Voice Recordings Data Expiration Rule"
        expiration_in_days = 90
        prefix             = "voice-recordings/"
      }
    }
  }
}
