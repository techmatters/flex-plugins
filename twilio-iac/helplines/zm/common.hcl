locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "ChildLine Zambia"
    old_dir_prefix                    = ""
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-US"
    voice_ivr_language                = ""
    enable_post_survey                = false

    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/zm/templates/workflows/master.tftpl"
      },
      queue_transfers : {
        friendly_name : "Queue Transfers Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/queue-transfers.tftpl"
      },
      survey : {
        friendly_name : "Survey Workflow"
        templatefile : "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }


    task_queues = {
      lifeline : {
        "target_workers" = "1==1",
        "friendly_name"  = "LifeLine Zambia (ZM)"
      },
      childline : {
        "target_workers" = "1==1",
        "friendly_name"  = "ChildLine Zambia (ZM)"
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

   
    lex_bot_languages = {
      en_US : ["pre_survey", "language_selector"],
      bem : ["pre_survey"],
      kqn : ["pre_survey"],
      loz : ["pre_survey"],
      lun : ["pre_survey"],
      nyz : ["pre_survey"],
      toi : ["pre_survey"]
    }

  }
}
