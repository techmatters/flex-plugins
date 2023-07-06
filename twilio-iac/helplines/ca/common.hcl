locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Kids Help Phone"
    old_dir_prefix                    = "kidshelpphone"
    definition_version                = "ca-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "{{trigger.message.ChannelAttributes.pre_engagement_data.language}}"
    helpline_language                 = "en-CA"
    contacts_waiting_channels         = ["voice", "web"]
    enable_post_survey                = false


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
        "target_workers" = "routing.skills HAS 'Interpreter' ",
        "friendly_name"  = "Interpreter"
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
        "target_workers" = "routing.skills HAS 'HCENG'",
        "friendly_name"  = "Health Canada English"
      },
      health_canada_fr : {
        "target_workers" = "routing.skills HAS 'HCFR'",
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
