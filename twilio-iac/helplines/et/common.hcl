locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

 
  local_config = {
    helpline                          = "Adama Child Helpline"
    old_dir_prefix                    = "adama"
    definition_version                = "et-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en"
    helpline_language                 = "en"
    voice_ivr_language                = ""
    enable_post_survey                = false
    
   
    lex_bot_languages  = {
      en : ["pre_survey"]
    }
    

    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      messaging : {
        "target_workers" = "1==1",
        "friendly_name"  = "Messaging"
      },
       survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
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
