/**
 * Aselo Okta Pilot (ASOP): test helpline for the Okta / Flex SSO process (see twilio-iac/docs/okta.md)
 * and for the end-to-end new helpline onboarding (see twilio-iac/docs/new-account-provisioning.md).
 * Baseline shape: 1 queue, 1 workflow, a webchat channel and a voice channel.
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "Aselo Okta Pilot"
    task_language              = "en-US"
    enable_post_survey         = false
    enable_external_recordings = true
    # Test helpline: reuses the HRM demo permission rules instead of its own permission-rules/asop.json
    permission_config          = "demo"
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/master-basic.tftpl"
      }
    }
    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "Aselo Okta Pilot"
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
          voice_ivr_greeting_message = "Hello, thank you for calling Aselo Okta Pilot. Please wait for a counsellor."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      }
    }

    # Okta: helpline-level, shared by staging and production apps (okta-org stage). See twilio-iac/docs/okta.md
    okta = {
      group_name = "Aselo Okta Pilot (ASOP)"
      # Test of a Terraform-managed group rule: users whose Okta organization is "Aselo Okta Pilot"
      group_rule = { organizations = ["Aselo Okta Pilot"] }
    }
  }
}
