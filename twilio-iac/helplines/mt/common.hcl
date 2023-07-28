locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Kellimni"
    old_dir_prefix                    = "mt-kellimni"
    definition_version                = "mt-v1"
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-MT"
    helpline_language                 = "en-MT"
    voice_ivr_language                = ""
    contacts_waiting_channels         = ["web", "whatsapp", "facebook", "instagram"]
    enable_post_survey                = false



    lex_bot_languages = {
      en_MT : ["pre_survey", "language_selector"],
      mt_MT : ["pre_survey"],
      uk_MT : ["pre_survey"]
    }


    workflows = {
      master : {
        friendly_name : "Master Workflow"
        templatefile : "/app/twilio-iac/helplines/jm/templates/workflows/master.tftpl"
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
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/web.tftpl"
        channel_flow_vars = {
          handoff_message_EN = "We'll transfer you now, please hold for a professional."
          handoff_message_MT = "Ha nittrasferuk lil wieħed Proffesjonist/a tagħna."
          handoff_message_UK = "Ми переведемо вас зараз, будь ласка, чекайте спеціаліста."
          widget_from           = "Kellimni"
        }
        chatbot_unique_names = []
      },
       facebook : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
          handoff_message_EN = "We'll transfer you now, please hold for a professional."
          handoff_message_MT = "Ha nittrasferuk lil wieħed Proffesjonist/a tagħna."
          handoff_message_UK = "Ми переведемо вас зараз, будь ласка, чекайте спеціаліста."
          widget_from           = "Kellimni"
        }
        chatbot_unique_names = []
      }
       whatsapp : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
          handoff_message_EN = "We'll transfer you now, please hold for a professional."
          handoff_message_MT = "Ha nittrasferuk lil wieħed Proffesjonist/a tagħna."
          handoff_message_UK = "Ми переведемо вас зараз, будь ласка, чекайте спеціаліста."
          widget_from           = "Kellimni"
        }
        chatbot_unique_names = []
      }
       instagram : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/mt/templates/studio-flows/messaging.tftpl"
        channel_flow_vars = {
          handoff_message_EN = "We'll transfer you now, please hold for a professional."
          handoff_message_MT = "Ha nittrasferuk lil wieħed Proffesjonist/a tagħna."
          handoff_message_UK = "Ми переведемо вас зараз, будь ласка, чекайте спеціаліста."
          widget_from           = "Kellimni"
        }
        chatbot_unique_names = []
      }
    }
    phone_numbers = {}
  }