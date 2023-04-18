locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = "channelType ==\"web\" OR isContactlessTask == true"

    workflows = [
      {
        "friendly_name" = "Master Workflow",
        "filters" = [{
          expression           = "(to==\"+15878407089\" AND language CONTAINS \"en-CA\") OR isContactlessTask == true"
          filter_friendly_name = "KHP English"
          targets = [
            {
              expression = "(worker.waitingOfflineContact != true AND ((task.channelType == 'voice' AND worker.channel.chat.assigned_tasks == 0) OR (task.channelType != 'voice' AND worker.channel.voice.assigned_tasks == 0)) AND ((task.transferTargetType == 'worker' AND task.targetSid == worker.sid) OR (task.transferTargetType != 'worker' AND worker.sid != task.ignoreAgent))) OR (worker.waitingOfflineContact == true AND task.targetSid == worker.sid AND task.isContactlessTask == true)"
              queue      = "KHP English"
            }
          ]
        }]

      }
    ]


  }
}