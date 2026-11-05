/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "<helpline name>"
    task_language              = "en-US"
    enable_post_survey         = false
    enable_external_recordings = true
    permission_config          = "demo"
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
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
    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "<helpline name>"
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
    #Channels
    channels = {
      chat : {
        channel_type         = "chat"
        messaging_mode       = "conversations"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

    # Okta: helpline-level, shared by staging and production apps (okta-org stage). See twilio-iac/docs/okta.md
    okta = {
      group_name = "<helpline name> (<SHORT CODE>)"
      # Optional: add users automatically. Set exactly one of email_domains, organizations or expression.
      # Terraform does not create the rule: a Super/Org Admin creates it in Okta (see docs/okta.md "Group rules").
      # group_rule = { organizations = ["<organization>"] }
      # group_rule = { email_domains = ["@<domain>"] }
      # group_rule = { expression = "<Okta Expression Language>" }
    }
  }
}