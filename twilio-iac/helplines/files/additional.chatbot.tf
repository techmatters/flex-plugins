/**
 * This is pretty hacky, but it is short term, so I'm not going to worry about it too much.
 * The[chatbot stage module's chatbot_sids output ../../terraform-modules/stages/chatbot/outputs.tf
 * dependnds on this custom_chatbots local variable so that it can merge together outputs from
 * the "standard" chatbot module and any helpline specific custom chatbot modules.
 * See the co chatbot for an example: ../co/files/additional.chatbot.tf
 **/
locals {
  custom_chatbots = {}
}
