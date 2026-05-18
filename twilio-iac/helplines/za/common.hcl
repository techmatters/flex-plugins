locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                          = "Childline South Africa"
    old_dir_prefix                    = ""
    definition_version                = "za-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-ZA"
    helpline_language                 = "en-US"
    voice_ivr_language                = ""
    enable_post_survey                = false
    permission_config                 = "za"


    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/za/templates/workflows/master.tftpl"
      },
      survey : {
        friendly_name = "Survey Workflow"
        templatefile  = "/app/twilio-iac/helplines/templates/workflows/lex.tftpl"
      }
    }

    task_queues = {
      webchat : {
        "target_workers"       = "routing.skills HAS 'chat'",
        "friendly_name"        = "Childline South Africa Chat"
        "max_reserved_workers" = 5
      },
      facebook : {
        "target_workers"       = "1!=1",
        "friendly_name"        = "Facebook"
      },
      free_state : {
        "target_workers"       = "routing.skills HAS 'Free State'",
        "friendly_name"        = "Childline Free State"
      },
      mpumalanga : {
        "target_workers"       = "routing.skills HAS 'Mpumalanga'",
        "friendly_name"        = "Childline Mpumalanga"
      },
      western_cape : {
        "target_workers"       = "routing.skills HAS 'Western Cape'",
        "friendly_name"        = "Childline Western Cape"
      },
      offline : {
        "target_workers"       = "1==1",
        "friendly_name"        = "Offline"
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


  }
}
