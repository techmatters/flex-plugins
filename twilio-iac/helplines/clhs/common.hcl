/**
 * Basic Helpline configuration -- copy these files to begin setting up a new helpline
 * Replace <helpline name> for the actual name of the helpline
 **/
locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)


  local_config = {
    helpline                   = "Hora Segura"
    task_language              = "es-CLHS"
    enable_post_survey         = true
    enable_external_recordings = false
    permission_config          = "clhs"
    helpline_region            = "us-east-1"
    enable_lex_v2                     = true
    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/clhs/templates/workflows/master.tftpl"
        task_reservation_timeout = 60
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
        "friendly_name"  = "Atención",
        "max_reserved_workers" = 5
      },
      priority : {
        "target_workers" = "1==1",
        "friendly_name"  = "Contactos Urgentes",
        "max_reserved_workers" = 5
      }
      survey : {
        "target_workers" = "1==0",
        "friendly_name"  = "Survey"
      },
      e2e_test : {
        "target_workers" = "email=='aselo-alerts+production@techmatters.org'",
        "friendly_name"  = "E2E Test Queue"
      }
    }

    lex_v2_bot_languages = {
      es_CLHS : ["post_survey"]
    }
   custom_task_routing_filter_expression = "channelType IN ['web']"
    flow_vars = {
      widget_from                           = "Hora Segura"
      chat_blocked_message                  = "Hola, perdona, has sido bloqueado temporalmente de nuestros servicios."
      send_message_webchat_welcome_prequeue = "¡Hola! Te damos la bienvenida a este espacio seguro para conversar. En instantes te pondremos en contacto con nuestro equipo para poder iniciar la conversación. "
    }
    #Channels
    channels = {
      webchat : {
        channel_type         = "web"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/templates/studio-flows/messaging-blocking-welcome-lambda-sd.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
        enable_datadog_monitor = true
        custom_monitor = {
          query = "sum(last_24h):sum:<metric>{*}.as_count() == 0"
          custom_schedule = {
            rrule    = "FREQ=DAILY;INTERVAL=1;BYHOUR=10;BYMINUTE=0"
            timezone = "America/Santiago"
          }
        }
      }
    }
    ui_editable = true
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "Perdona, nuestro sistema está experimentando algunos problemas técnicos. Tu contacto puede que no llegue a ser atendido o experimente interrupciones."
      voice_message                    = "Our chat system is currently experiencing technical difficulties. We apologize for the inconvenience and are working to get it back online as soon as possible. If this is an emergency, please call +260955065373. Please note that this is not a toll-free line so you may incur costs."
      send_studio_message_function_sid = ""
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
    
  }
}