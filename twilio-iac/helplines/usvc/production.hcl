/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression     = ""
    flow_vars                                 = {}
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "The hotline is temporarily unavailable. If you are seeking immediate, non-emergency assistance please visit victimconnect.org for available resources. \nNuestras líneas están temporalmente indisponible. Para víctimas en busca de recursos inmediatos, les invitamos a visitar nuestro Mapa de Recursos VictimConnect disponible en la página web victimconnect.org."
      voice_message                    = "The hotline is temporarily unavailable. If you are seeking immediate, non-emergency assistance please visit victimconnect.org for available resources. \nNuestras líneas están temporalmente indisponible. Para víctimas en busca de recursos inmediatos, les invitamos a visitar nuestro Mapa de Recursos VictimConnect disponible en la página web victimconnect.org."
      send_studio_message_function_sid = "ZH4b9cf9eb89b74a9ae256a731f8f4bc99"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
    debug_mode = "tasks_created"
  }
}
