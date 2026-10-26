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
    # Baseline: 1 queue, 1 workflow, a webchat channel and a voice channel. Add more as the helpline needs.
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/master-basic.tftpl"
      }
      # Add when the account uses a Conversations channel (chat/SMS/WhatsApp...), for queue transfers:
      # queue_transfers : {
      #   friendly_name = "Queue Transfers Workflow"
      #   templatefile  = "/app/twilio-iac/helplines/templates/workflows/queue-transfers.tftpl"
      # }
    }
    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "<helpline name>"
      }
    }

    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-lambda.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, thank you for calling <helpline name>. Please wait for a counsellor."
          voice_ivr_language         = "en-US"
        }
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