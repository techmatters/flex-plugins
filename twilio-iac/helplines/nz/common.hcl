locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Youthline"
    old_dir_prefix                    = ""
    definition_version                = "nz-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-US"
    helpline_language                 = "en-US"
    contacts_waiting_channels         = ["voice","sms","web"]
    enable_post_survey                = false


    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      }
    }

    task_queues = {
      master : {
        "target_workers" = "1==1",
        "friendly_name"  = "Youthline"
      }
    }
    
    #Channels
     channels = {
      webchat : {
        channel_type = "web"
        contact_identity = ""
        templatefile = "/app/twilio-iac/helplines/templates/studio-flows/webchat-basic.tftpl"
        channel_flow_vars = {}
        chatbot_unique_names =[]
      }/*,
      voice : {
        channel_type = "voice"
        contact_identity = ""
        templatefile = "/app/twilio-iac/helplines/templates/studio-flows/voice-basic.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, welcome to Youthline. Please wait for a counsellor."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names =[]
      },
      sms : {
        channel_type = "sms"
        contact_identity = ""
        templatefile = "/app/twilio-iac/helplines/templates/studio-flows/sms-basic.tftpl"
        channel_flow_vars = {}
        chatbot_unique_names =[]
      }*/
    }

  }
}
