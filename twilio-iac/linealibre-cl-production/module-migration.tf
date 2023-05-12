#Module migration for taskRouter and channels
#This is a separated file since it will be useful for other helplines

#Moving survey module
moved {
  from = module.survey.twilio_taskrouter_workspaces_task_queues_v1.survey_queue
  to   = module.taskRouter.twilio_taskrouter_workspaces_task_queues_v1.task_queue["survey"]
}

moved {
  from = module.survey.twilio_taskrouter_workspaces_workflows_v1.survey_workflow
  to   = module.taskRouter.twilio_taskrouter_workspaces_workflows_v1.workflow["survey"]
}

moved {
  from = module.survey.twilio_taskrouter_workspaces_task_channels_v1.survey
  to   = module.taskRouter.twilio_taskrouter_workspaces_task_channels_v1.task_channel["survey"]
}




#Moving flex flows 
moved {
  from = module.twilioChannel["webchat"].twilio_flex_flex_flows_v1.channel_flow
  to   = module.channel.twilio_flex_flex_flows_v1.channel_flow["webchat"]
}

moved {
  from = module.twilioChannel["twitter"].twilio_flex_flex_flows_v1.channel_flow
  to   = module.channel.twilio_flex_flex_flows_v1.channel_flow["twitter"]
}

moved {
  from = module.twilioChannel["instagram"].twilio_flex_flex_flows_v1.channel_flow
  to   = module.channel.twilio_flex_flex_flows_v1.channel_flow["instagram"]
}

moved {
  from = module.twilioChannel["whatsapp"].twilio_flex_flex_flows_v1.channel_flow
  to   = module.channel.twilio_flex_flex_flows_v1.channel_flow["whatsapp"]
}

moved {
  from = module.twilioChannel["line"].twilio_flex_flex_flows_v1.channel_flow
  to   = module.channel.twilio_flex_flex_flows_v1.channel_flow["line"]
}

#Moving studio flows
moved {
  from = module.twilioChannel["webchat"].twilio_studio_flows_v2.channel_messaging_flow
  to   = module.channel.twilio_studio_flows_v2.channel_studio_flow["webchat"]
}

moved {
  from = module.twilioChannel["twitter"].twilio_studio_flows_v2.channel_messaging_flow
  to   = module.channel.twilio_studio_flows_v2.channel_studio_flow["twitter"]
}

moved {
  from = module.twilioChannel["instagram"].twilio_studio_flows_v2.channel_messaging_flow
  to   = module.channel.twilio_studio_flows_v2.channel_studio_flow["instagram"]
}

moved {
  from = module.twilioChannel["whatsapp"].twilio_studio_flows_v2.channel_messaging_flow
  to   = module.channel.twilio_studio_flows_v2.channel_studio_flow["whatsapp"]
}

moved {
  from = module.twilioChannel["line"].twilio_studio_flows_v2.channel_messaging_flow
  to   = module.channel.twilio_studio_flows_v2.channel_studio_flow["line"]
}

#Moving aws parameters
moved {
  from = module.twilioChannel["line"].aws_ssm_parameter.channel_flex_flow_sid_parameter
  to   = module.channel.aws_ssm_parameter.channel_flex_flow_sid_parameter["line"]
}

moved {
  from = module.twilioChannel["twitter"].aws_ssm_parameter.channel_flex_flow_sid_parameter
  to   = module.channel.aws_ssm_parameter.channel_flex_flow_sid_parameter["twitter"]
}

moved {
  from = module.twilioChannel["instagram"].aws_ssm_parameter.channel_flex_flow_sid_parameter
  to   = module.channel.aws_ssm_parameter.channel_flex_flow_sid_parameter["instagram"]
}

