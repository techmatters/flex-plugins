module "custom_chatbots" {
  source         = "../../chatbots/te-guio-co"
  serverless_url = local.serverless_url
}

output "custom_chatbot_sids" {
  value = {
    this = module.custom_chatbots.pre_survey_bot_es_sid
  }
}
