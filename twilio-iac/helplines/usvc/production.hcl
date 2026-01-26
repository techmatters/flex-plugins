/**
 * This file overrides the config output by `common.hcl` that are specific to the production environment.
 **/

locals {
  common_config_hcl = read_terragrunt_config("common.hcl")
  common_config     = local.common_config_hcl.locals.config
  config            = merge(local.common_config, local.local_config)

  local_config = {
    flow_vars = {

      # Webchat
      vc_url   = "https://victimconnect.org"
      dcvh_url = "https://dcvictim.org"


      #VC Webchat
      send_message_vc_webchat_prequeue = "Thank you for contacting the VictimConnect Resource Center. One of our Victim Assistance Specialists will be with you shortly. To receive services in a preferred language other than English, please call 1-855-4-VICTIM (1-855-484-2846). Gracias por contactar el Centro de Recursos VictimConnect. La línea de VictimConnect no ofrece servicios por chat en español en este momento. Para obtener servicios en español o para hablar con un intérprete, por favor llame al 1-855-4-VICTIM (1-855-484-2846)."
      #VC SMS
      send_message_vc_sms_welcome    = "Thank you for contacting the VictimConnect Resource Center. We'll message only to support your conversation (no marketing). Message frequency may vary. Msg&Data rates may apply. Reply STOP to end, HELP for SMS help.\nPrivacy: https://victimconnect.org/get-help/privacy-policy/ \nTo receive services in a preferred language other than English, please call 1-855-4VICTIM (855-484-2846).\nPara ayuda en español, por favor llame al 1-855-4VICTIM (855-484-2846)."
      send_message_vc_sms_no_service = "Thank you. Your safety matters to us.\nWe will need to disconnect now and recommend that you contact emergency services immediately. You are always welcome to contact us again at a later time when you are able. "
      send_message_vc_sms_prequeue   = "Thank you for contacting the VictimConnect Resource Center. One of our Victim Assistance Specialists will be with you shortly. We are a confidential and anonymous resource. We ask that you do not share any personally identifying information like your full name, date of birth or address. We also ask that you not share any attachments, images, video, or any other identifying media as our system cannot process the media.\nTo receive services in a preferred language other than English, please call 1-855-4-VICTIM (1-855-484-2846)."
      send_wait_vc_sms_safety        = "We are unable to provide emergency services or dispatch emergency services on your behalf, so it is important that you are in a space free from danger or immediate threat of physical harm before we proceed. \nAre you in a space where you can talk with us without immediate threat of danger or physical harm?\n Reply Yes or No to continue."
      #VC Voice
      play_message_vc_voice_en_welcome  = "Thank you for calling the VictimConnect Resource Center."
      play_message_vc_voice_es_welcome  = "Gracias por llamar al Centro de Recursos VictimConnect."
      gather_input_vc_voice_en_language = "If you're seeking support, information, or referrals in English, Press 1."
      gather_input_vc_voice_es_language = "Para asistencia o ayuda en español, oprima dos."
      play_message_vc_voice_en_prequeue = "Thank you for contacting the VictimConnect Resource Center. Please note that we are not an emergency service. If you need emergency assistance, please disconnect and contact your local authorities or emergency services. Thank you for your patience as you wait to connect to a Victim Assistance Specialist. "
      play_message_vc_voice_es_prequeue = "Gracias por comunicarse con el Centro de Recursos VictimConnect. Su seguridad es importante para nosotros. Nuestro servicio no ofrece asistencia de emergencia. Si se encuentra en peligro, por favor desconecte y contacte a la policía o al programa de asistencia de emergencia de su área."
      #DCVH Webchat
      send_message_dcvh_webchat_prequeue = "Thank you for contacting the DC Victim Hotline. One of our Victim Assistance Specialists will be with you shortly. To receive services in a preferred language other than English, please call 1-844-4HELPDC (1-844-443-5732) Gracias por contactar al centro de recursos de victimas en Washington, DC.\nLa línea de DC Victim Hotline no ofrece asistencia por chat en español. Para servicios en español o para hablar con un intérprete, llame al 1-855-4HELPDC (1-844-443-5732)."
      #DCVH  SMS
      send_message_dcvh_sms_welcome    = "Thank you for contacting the DC Victim Hotline. We'll message only to support your conversation (no marketing). Message frequency may vary. Msg&Data rates may apply. Reply STOP to end, HELP for SMS help.\nPrivacy: https://dcvictim.org/get-help/privacy/ \nTo receive services in a preferred language other than English, please call 1-855-4HELPDC (1-844-443-5732).\nPara ayuda en español, por favor llame al 1-855-4HELPDC (1-844-443-5732)."
      send_message_dcvh_sms_no_service = "Thank you, your safety matters to us.\nWe will need to disconnect now and recommend that you contact emergency services immediately. You are always welcome to contact us again at a later time when you are able. "
      send_message_dcvh_sms_prequeue   = "Thank you for contacting the DCVH. One of our Victim Assistance Specialists will be with you shortly. We are a confidential and anonymous resource. We ask that you do not share any personally identifying information like your full name, date of birth or address. We also ask that you not share any attachments, images, video, or any other identifying media as our system cannot process the media."
      send_wait_dcvh_sms_safety        = "We are unable to provide emergency services or dispatch emergency services on your behalf, so it is important that you are in a space free from danger or immediate threat of physical harm before we proceed. \nAre you in a space where you can talk with us without immediate threat of danger or physical harm?\n Reply Yes or No to continue."
      #DCVH Voice
      play_message_dcvh_voice_en_welcome        = "Thank you for calling the DC Victim Hotline."
      play_message_dcvh_voice_es_welcome        = "Gracias por llamar al centro de recursos de víctimas en Washington DC."
      gather_input_dcvh_voice_en_language       = "We provide services for both survivors and professionals. If you are a survivor or professional seeking services related to emotional support, information or referrals, press 1 for English or 2 for Spanish. If you are a professional seeking sexual assault dispatch services, press 3."
      gather_input_dcvh_voice_es_language       = "Gracias por llamar a DC Victim Hotline. Ofrecemos servicios para sobrevivientes de crímenes y a profesionales. Si usted es una víctima o un profesional y busca apoyo emocional, información o referencias, presione 2 para recibir asistencia en español. "
      play_message_dcvh_voice_en_prequeue       = "Thank you for contacting the DC Victim Hotline. Please note that we are not an emergency service. If you need emergency assistance, please disconnect and contact your local authorities or emergency services. Thank you for your patience as you wait to connect to a Victim Assistance Specialist. "
      play_message_dcvh_voice_es_prequeue       = "Gracias por contactar al DC Victim Hotline. Su seguridad es importante para nosotros. Nuestro servicio no ofrece asistencia de emergencia. Si su seguridad corre peligro inmediato, por favor desconéctese y contacte a la policía o al servicio de emergencia local."
      play_message_dcvh_voice_dispatch_prequeue = "Thank you for contacting DCVH dispatch services. A Victim Assistance Specialist will be with you shortly. We appreciate your patience as we assist other callers."



    }
    //Serverless -- to allow enabling the operating hours check on this staging account.
    ui_editable = true
    #Channels
    channels = {
      webchat : {
        channel_type     = "web"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/webchat-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice_vc : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/voice-vc-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      voice_dcvh : {
        channel_type     = "voice"
        contact_identity = ""
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/voice-dcvh-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      sms_dcvh_toll_free : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+18444435732"
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/sms-dcvh-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      },
      sms_vc_toll_free : {
        messaging_mode   = "conversations"
        channel_type     = "sms"
        contact_identity = "+18554842846"
        templatefile     = "/app/twilio-iac/helplines/usvc/templates/studio-flows/sms-vc-sd.tftpl"
        channel_flow_vars = {
        }
        chatbot_unique_names = []
      }
    }
    get_profile_flags_for_identifier_base_url = "https://hrm-staging.tl.techmatters.org/lambda/twilio/account-scoped"
    #System Down Configuration
    system_down_templatefile = "/app/twilio-iac/helplines/templates/studio-flows/system-down.tftpl"
    enable_system_down       = true
    system_down_flow_vars = {
      is_system_down                   = "false"
      message                          = "The hotline is temporarily unavailable. If you are seeking immediate, non-emergency assistance please visit victimconnect.org for available resources. \nNuestras líneas están temporalmente indisponible. Para víctimas en busca de recursos inmediatos, les invitamos a visitar nuestro Mapa de Recursos VictimConnect disponible en la página web victimconnect.org."
      voice_message                    = "The hotline is temporarily unavailable. If you are seeking immediate, non-emergency assistance please visit victimconnect.org for available resources. \nNuestras líneas están temporalmente indisponible. Para víctimas en busca de recursos inmediatos, les invitamos a visitar nuestro Mapa de Recursos VictimConnect disponible en la página web victimconnect.org."
      send_studio_message_function_sid = "ZH6bec53d130c90f4a4e50605390514745"
      call_action                      = "message"
      forward_number                   = "+123"
      recording_url                    = "https://<place_holder>.mp3"
    }
    debug_mode = "widget_failures"
  }
}
