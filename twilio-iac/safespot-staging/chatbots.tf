// Legacy file only kept to facilitate migration. Once all accounts have been migrated to use the module, delete me.
// Known accounts that require migration: aarambh production, safespot staging

moved {
  from = twilio_autopilot_assistants_v1.pre_survey
  to = module.chatbots.twilio_autopilot_assistants_v1.pre_survey
}

moved {
  from = twilio_autopilot_assistants_v1.post_survey
  to = module.chatbots.twilio_autopilot_assistants_v1.post_survey
}

moved {

  from = twilio_autopilot_assistants_tasks_v1.survey
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.survey
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.redirect_function
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.redirect_function
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.gender_why
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.gender_why
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.survey_start
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.survey_start
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.counselor_handoff
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.counselor_handoff
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.fallback
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.fallback
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.greeting
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.greeting
}

moved {
  from = twilio_autopilot_assistants_tasks_samples_v1.greeting_group
  to = module.chatbots.twilio_autopilot_assistants_tasks_samples_v1.greeting_group
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.collect_fallback
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.collect_fallback
}

moved {
  from = twilio_autopilot_assistants_tasks_v1.goodbye
  to = module.chatbots.twilio_autopilot_assistants_tasks_v1.goodbye
}

moved {
  from = twilio_autopilot_assistants_tasks_samples_v1.goodbye_group
  to = module.chatbots.twilio_autopilot_assistants_tasks_samples_v1.goodbye_group
}

moved {
  from = twilio_autopilot_assistants_field_types_v1.age
  to = module.chatbots.twilio_autopilot_assistants_field_types_v1.age
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.number_age_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.number_age_group
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.unknown_age_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.unknown_age_group
}

moved {
  from = twilio_autopilot_assistants_field_types_v1.gender
  to = module.chatbots.twilio_autopilot_assistants_field_types_v1.gender
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.gender_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.gender_group
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.gender_boy_synonym_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.gender_boy_synonym_group
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.gender_girl_synonym_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.gender_girl_synonym_group
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.gender_unknown_synonym_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.gender_unknown_synonym_group
}

moved {
  from = twilio_autopilot_assistants_field_types_field_values_v1.gender_nonbinary_synonym_group
  to = module.chatbots.twilio_autopilot_assistants_field_types_field_values_v1.gender_nonbinary_synonym_group
}