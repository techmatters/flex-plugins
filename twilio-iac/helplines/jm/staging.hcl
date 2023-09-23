locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
     custom_task_routing_filter_expression = "isContactlessTask==true OR channelType=='web' OR to=='+14244147346' OR twilioNumber=='whatsapp:+18767287042' OR twilioNumber=='instagram:17841453865951519'"

    #Studio flow
    flow_vars = {
      service_sid                            = "ZS9dbe7c77fe5f0a6ed3c392c63bba9c90"
      environment_sid                        = "ZE82cbf2bcb65cf4e44c436a24d3024fb5"
      capture_channel_with_bot_function_sid  = "ZH07b25b75594049950f1b4384ceeedfcb"
      capture_channel_with_bot_function_name = "channelCapture/captureChannelWithBot"
      chatbot_callback_cleanup_function_id   = "ZHd8e7e7801687a833b4377b5c90305452"
      chatbot_callback_cleanup_function_name = "channelCapture/chatbotCallbackCleanup"
      bot_language                           = "en-JM"
    }

    ui_editable = false
    #Chatbots


  }
}