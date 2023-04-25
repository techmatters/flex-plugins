locals {
  custom_chatbots = {
    pre_survey: {
       sid = module.custom_chatbots.pre_survey_bot_es_sid
       }
    post_survey: {
      sid= module.custom_chatbots.post_survey_bot_es_sid
    }
  }
}

module "custom_chatbots" {
  source         = "../../chatbots/te-guio-co"
  serverless_url = local.serverless_url
}
