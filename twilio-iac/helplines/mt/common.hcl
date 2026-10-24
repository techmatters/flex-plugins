locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Kellimni"
    task_language                     = "en-MT"
    voice_ivr_language                = ""
    contacts_waiting_channels         = ["web", "whatsapp", "facebook", "instagram"]
    enable_post_survey                = false
    helpline_region                   = "eu-west-1"
    permission_config                 = "mt"



    workflows = {
      master : {
        friendly_name            = "Master Workflow"
        templatefile             = "/app/twilio-iac/helplines/mt/templates/workflows/master.tftpl"
        task_reservation_timeout = 86400
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
        "friendly_name"  = "Kellimni"
      },
      ecpm : {
        "target_workers" = "1==1",
        "friendly_name"  = "ECPM"
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
    task_channels = {
      default : "Default"
      chat : "Programmable Chat"
      voice : "Voice"
      sms : "SMS"
      video : "Video"
      email : "Email"
      survey : "Survey"
    }
    lex_v2_bot_languages = {
      en_MT : ["pre_survey", "language_selector", "terms_conditions_acceptance"],
      mt_MT : ["pre_survey", "terms_conditions_acceptance"],
      uk : ["pre_survey", "terms_conditions_acceptance"]
    }


    phone_numbers = {}

    # Okta: helpline-level, shared by staging and production apps (okta-org stage). See twilio-iac/docs/okta.md
    okta = {
      group_name            = "Kellimni (MT)"
      group_rule_expression = "user.organization==\"Kellimni\""
      import_existing       = true
    }
  }
}
