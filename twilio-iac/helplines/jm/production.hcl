locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {

     custom_task_routing_filter_expression = "helpline=='SafeSpot' OR channelType=='web' OR to=='+14244147346' OR to=='+18767287042' OR twilioNumber=='instagram:17841444523369053' OR twilioNumber=='messenger:107246798170317'"
    
    #Studio flow
    flow_vars = {
      service_sid                            = "ZSf7422a38f3b243b8aab97ca268f4ce6b"
      environment_sid                        = "ZE471872ba9e5a44ea96c773adb2b9076c"
      capture_channel_with_bot_function_sid  = "ZH211708560ea265161b4ad235d2d99922"
      capture_channel_with_bot_function_name = "channelCapture/captureChannelWithBot"
      chatbot_callback_cleanup_function_id   = "ZH269e007928bfa8d3dbd4e7b806d8d690"
      chatbot_callback_cleanup_function_name = "channelCapture/chatbotCallbackCleanup"
      bot_language                           = "en-JM"
    }

  
 
  }
}