locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline       = "Kids Help Phone"
    old_dir_prefix = "kidshelpphone"

    definition_version = "ca-v1"

    default_autopilot_chatbot_enabled = false

    twilio_channels = {
      "webchat" = { "contact_identity" = "", "channel_type" = "web" }
    }

    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/ca/templates/workflows/master-workflow.tftpl"
      }
    }

    task_queues = {
      aggregate : {
        "target_workers" = "1==1",
        "friendly_name"  = "Aggregate"
      },
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      },
      khp_en : {
        "target_workers" = "routing.skills HAS 'KHP English'",
        "friendly_name"  = "KHP English"
      },
      khp_fr : { "target_workers" = "routing.skills HAS 'KHP French'",
        "friendly_name"           = "KHP French"
      },
      ab211_en : {
        "target_workers" = "routing.skills HAS 'AB211 English'",
        "friendly_name"  = "AB211 English"
      },
      ab211_fr : {
        "target_workers" = "routing.skills HAS 'AB211 French'",
        "friendly_name"  = "AB211 French"
      },
      g2t_ns_en : {
        "target_workers" = "routing.skills HAS 'Good2Talk NS English'",
        "friendly_name"  = "Good2Talk NS English"
      },
      g2t_ns_fr : {
        "target_workers" = "routing.skills HAS 'Good2Talk NS French'",
        "friendly_name"  = "Good2Talk NS French"
      },
      g2t_on_en : {
        "target_workers" = "routing.skills HAS 'Good2Talk ON English'",
        "friendly_name"  = "Good2Talk ON English"
      },
      g2t_on_fr : {
        "target_workers" = "routing.skills HAS 'Good2Talk ON French'",
        "friendly_name"  = "Good2Talk ON French"
      },
      g2t_on_zh : {
        "target_workers" = "routing.skills HAS 'Good2Talk ON Mandarin'",
        "friendly_name"  = "Good2Talk ON Mandarin"
      },
      interpreter_en : {
        "target_workers" = "routing.skills HAS 'Interpreter' ",
        "friendly_name"  = "Interpreter"
      },
      interpreter_fr : {
        "target_workers" = "routing.skills HAS 'French Interpreter'",
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
      health_canada_en : {
        "target_workers" = "routing.skills HAS 'Health Canada English'",
        "friendly_name"  = "Health Canada English"
      },
      health_canada_fr : {
        "target_workers" = "routing.skills HAS 'Health Canada French'",
        "friendly_name"  = "Health Canada French"
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
        "target_workers" = "routing.skills HAS 'Indigenous [Interpreter]'",
        "friendly_name"  = "Indigenous [Interpreter]"
      }
    }
  }
}
