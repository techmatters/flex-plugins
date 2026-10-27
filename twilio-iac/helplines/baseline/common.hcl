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
    # Baseline: 1 queue, a chat (webchat over Conversations) channel and a voice channel. Add more as the helpline needs.
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/master-basic.tftpl"
      }
      # Needed by every account with a Conversations channel (chat/SMS/WhatsApp...), for queue transfers
      queue_transfers : {
        friendly_name = "Queue Transfers Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/queue-transfers.tftpl"
      }
    }
    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "<helpline name>"
      }
    }

    #Channels
    channels = {
      # Webchat over Conversations. Don't use channel_type "web" (Programmable Chat): its Flex Flow API is gone
      chat : {
        messaging_mode       = "conversations"
        channel_type         = "chat"
        contact_identity     = ""
        # Studio flow: system-down check, blocked-contact check, pre-queue message, send to the queue
        templatefile = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-conv-lambda-sd.tftpl"
        channel_flow_vars = {
          send_message_prequeue = "Thank you for contacting <helpline name>. A counsellor will be with you shortly. If you are in immediate danger, please call 911."
        }
        chatbot_unique_names = []
      },
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        # Studio flow: system-down check, blocked-caller check, pre-queue message, send to the queue
        templatefile = "/app/twilio-iac/helplines/templates/studio-flows/voice-blocking-no-op-hours-sd.tftpl"
        channel_flow_vars = {
          voice_ivr_language          = "en-US"
          play_message_voice_prequeue = "Hello, thank you for calling <helpline name>. Please wait for a counsellor."
          play_message_voice_blocked  = "Sorry, you're not able to contact <helpline name> from this number."
        }
        chatbot_unique_names = []
      }
    }

    # System down: every Studio flow first runs this subflow (system-down stage, applied before configure).
    # To announce an outage set is_system_down = "true" and apply the system-down stage.
    # call_action for calls: "message" (say voice_message), "recording" (play recording_url) or "forward" (to forward_number).
    enable_system_down       = true
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    system_down_flow_vars = {
      is_system_down = "false"
      message        = "We're having some technical problems at the moment, so messages might not go through. We're working on it and will be back as soon as we can. Thanks for your patience."
      voice_message  = "We're having some technical problems at the moment, so calls might not go through. We're working on it and will be back as soon as we can. Thanks for your patience."
      call_action    = "message"
      forward_number = "+123"
      recording_url  = "https://<place_holder>.mp3"
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