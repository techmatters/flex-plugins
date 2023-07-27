locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

 
  local_config = {
    helpline                          = "SafeSpot"
    old_dir_prefix                    = "safespot"
    definition_version                = "jm-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-US"
    helpline_language                 = "en-US"
    voice_ivr_language                = ""
    contacts_waiting_channels         = ["web","whatsapp","facebook","instagram"]
    enable_post_survey                = false
    
   
    lex_bot_languages  = {
      en_JM : ["pre_survey"]
    }
    

    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/jm/templates/workflows/master.tftpl"
      }
    }

    task_queues = {
      messaging : {
        "target_workers" = "1==1",
        "friendly_name"  = "Messaging"
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

    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/templates/studio-flows/messaging-lex.tftpl"
        channel_flow_vars = {}
        chatbot_unique_names = []
      }
    }
    phone_numbers = {}

  }
}
