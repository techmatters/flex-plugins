locals {
  defaults_config_hcl = read_terragrunt_config(find_in_parent_folders("defaults.hcl"))
  defaults_config     = local.defaults_config_hcl.locals
  config              = merge(local.defaults_config, local.local_config)

  local_config = {
    helpline                          = "Youthline"
    old_dir_prefix                    = ""
    default_autopilot_chatbot_enabled = false
    task_language                     = "en-NZ"
    contacts_waiting_channels         = ["voice", "sms", "web"]

    workflows = {
      master : {
        friendly_name = "Master Workflow"
        templatefile  = "/app/twilio-iac/helplines/nz/templates/workflows/master.tftpl"
      }
    }

    task_queues = {
      youthline_helpline : {
        "target_workers" = "routing.skills HAS 'Youthline Helpline'",
        "friendly_name"  = "Youthline Helpline"
      },
      triage : {
        "target_workers" = "routing.skills HAS 'Triage'",
        "friendly_name"  = "Triage"
      }
    }


  }
}
