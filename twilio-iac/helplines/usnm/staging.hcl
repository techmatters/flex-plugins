/**
 * This file overrides the config output by `common.hcl` that are specific to the staging environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    custom_task_routing_filter_expression = ""
    flow_vars = {
      widget_from                                                     = "NAMI"
      chat_blocked_message                                            = "Hi, you've been blocked from accessing NAMI services and we are not able to read or receive further messages from you."
      send_message_prequeue                                           = "Welcome. Pleas wait for a specialist."
      custom_functions_url                                            = "https://custom-functions-4084.twil.io"
      usnm_recordings_url                                             = "https://usnm-recordings-6200.twil.io"
      is_skilled_worker_available_function_sid                        = "ZH85007840bfdc6245a8ffb08d98aad0eb"
      workspace_sid                                                   = "WSb9cb11d86ddcb7954dcdd20c391a7edc"
      custom_functions_service_id                                     = "ZSa976031394bdc8b5e95dc8c81e95f1e0"
      custom_functions_environment_id                                 = "ZE249accc6e2a97eb70428aba674cba636"
      send_message_sms_voip_blocked                                   = "We're unable to support conversations from VoIP or internet-based phone numbers at this time. Please try again using a mobile carrier number. If this is an emergency, call or text 988."
      send_message_sms_outside_us                                     = "This service is currently available only within the United States. If you are in immediate danger or need urgent support, please contact local emergency or crisis services in your area."
      send_message_sms_blocked_severity_level_1_acceptable_use_policy = "You have been redirected to this important message. Our team is here to provide support and referrals. We do not tolerate any form of inappropriate behavior, harassment, abuse or threats consistent with NAMI's acceptable use policy and/or HelpLine access policy. Communications from this number are no longer being accepted because they violate those policies. You are advised to discontinue contacting the NAMI HelpLine in this way. Otherwise, we will have no choice but to reach out to law enforcement about the nature of your communications. If you are experiencing a life-threatening emergency, call 911. If you are experiencing a mental health crisis that is not an immediate life-threatening emergency, contact 988 Suicide and Crisis Lifeline."
      send_message_sms_blocked__level_2_access_policy                 = "Because we care about you, the NAMI HelpLine has redirected you to this important message. Our team is here to provide support and referrals. We do not tolerate any form of harassment, abuse or threats consistent with NAMI's acceptable use policy and/or HelpLine access policy. Communications from this number are no longer being accepted because they violate those policies. You are advised to discontinue contacting the NAMI HelpLine in this way. Otherwise, we will have no choice but to reach out to law enforcement about the nature of your communications. Your safety and well-being and the safety and well-being of our staff are NAMI's top priorities. If you are experiencing a life-threatening emergency, call 911. If you are experiencing a mental health crisis that is not an immediate life-threatening emergency, contact 988 Suicide and Crisis Lifeline."
      send_message_sms_holiday                                        = "The NAMI HelpLine is now closed in observance of the national holiday. We will re-open on the following business day. Info and resources are online at https://www.nami.org/nami-helpline/ Email helpline@nami.org or leave a voicemail at 800-950-6264, and we'll respond in 1-2 business days."
      send_message_sms_closed                                         = "The NAMI HelpLine is now closed. We are open Monday-Friday, 10am-10pm ET. If you or another person are in crisis, please discontinue this text message and contact the 988 Suicide and Crisis Lifeline: https://988lifeline.org/chat/. Info and resources are online at https://www.nami.org/nami-helpline/. Email helpline@nami.org or leave a voicemail at 800-950-6264, and we'll respond in 1-2 business days."
      send_wait_sms_welcome                                           = "Welcome to the NAMI HelpLine. We are here to help with your mental health concerns, offer resources, and share support. If you are in crisis, reply CRISIS. Review NAMI HelpLine's Terms of Use: https://www.nami.org/terms-of-use/nami-helpline-terms-of-service/.\n\nIf you understand and agree to the terms of use, reply GO."
      send_message_sms_crisis                                         = "If you or another person are in crisis, please discontinue this text message and contact the 988 Suicide and Crisis Lifeline.\n\ntext: 988 or visit: https://988lifeline.org/chat/."
      send_wait_sms_name_request                                      = "We're glad you connected with the NAMI HelpLine. Would you mind sharing your name? If you want to remain anonymous, text NONE."
      send_message_sms_tya_info                                          = "NAMI is now offering a Teen and Young Adult HelpLine service. It brings together young people with shared experiences and equips specially trained HelpLine Specialists with knowledge and insights into what helps."
      send_message_sms_fcg_info                                          = "NAMI is now offering a Family Caregiver HelpLine service. It brings together family caregivers with shared experiences and equips HelpLine Specialists with knowledge and insights into what helps."
      send_wait_sms_service                                           = "Please choose an option:\nReply 1 to connect with a HelpLine Specialist.\nReply 2 if you are a teen or young adult and would like to chat with a Teen and Young Adult HelpLine Specialist.\nReply 3 if you are a family caregiver and would like to chat with a Family Caregiver HelpLine Specialist."
      send_wait_sms_contact_reason                                    = "To better help you, please share your reason for contacting the NAMI HelpLine."
      send_message_sms_prequeue_tya                                   = "You will be connected with the next available Teen and Young Adult HelpLine Specialist."
      send_message_sms_prequeue_fcg                                   = "You will be connected with the next available Family Caregiver HelpLine Specialist."
      send_message_sms_prequeue_std                              = "You will be connected with the next available NAMI HelpLine Specialist."
      send_wait_sms_no_tya_service                                    = "There are currently no Teen and Young Adult HelpLine Specialists available. Reply 1 to return to the standard SMS service or STOP to end your conversation. Info and resources are online at https://www.nami.org/nami-helpline/.  Email helpline@nami.org and we'll respond in 1-2 business days."
      send_wait_sms_no_fcg_service                                    = "There are currently no Family Caregiver HelpLine Specialists available. Reply 1 to return to the standard SMS service or STOP to end your conversation. Info and resources are online at https://www.nami.org/nami-helpline/.  Email helpline@nami.org and we'll respond in 1-2 business days."
      send_message_sms_max_retries                                    = "We haven't received a response, so we'll end this conversation for now. If you need support from the NAMI HelpLine, you can start a new conversation anytime."
    }


    #Channels
    channels = {
      voice : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usnm/templates/studio-flows/voice.tftpl"
        channel_flow_vars = {
          voice_ivr_greeting_message = "Hello, you are contacting NAMI. Please hold for a counsellor."
          voice_ivr_blocked_message  = "I'm sorry your number has been blocked."
          voice_ivr_language         = "en-US"
        }
        chatbot_unique_names = []
      },
      chat : {
        messaging_mode       = "conversations"
        channel_type         = "chat"
        contact_identity     = ""
        templatefile         = "/app/twilio-iac/helplines/usnm/templates/studio-flows/sms.tftpl"
        channel_flow_vars    = {}
        chatbot_unique_names = []
      }
    }

    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "We're currently experiencing technical issues, and your message may not be delivered. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      voice_message                    = "We're currently experiencing technical issues, and your call may not reach us. We're working to resolve the problem and will be back online shortly. We apologize for the inconvenience."
      send_studio_message_function_sid = "ZHbbf0fb1ec68a5aacc31e8c50415b97bb"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }

    get_profile_flags_for_identifier_base_url = "https://hrm-staging-us.tl.techmatters.org/lambda/twilio/account-scoped"
  }
}