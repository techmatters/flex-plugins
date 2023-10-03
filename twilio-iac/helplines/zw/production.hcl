locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)



  local_config = {

    #Studio flow
    flow_vars = {
      service_sid                            = "xx"
      environment_sid                        = "xx"
      capture_channel_with_bot_function_sid  = "xx"
      capture_channel_with_bot_function_name = "channelCapture/captureChannelWithBot"
    }
    
    #Channels
    channels = {
     
    }



  }
}