resource "aws_lex_bot_alias" "aselo_development" {
  bot_name    = "AseloDevSurvey"
  bot_version = "1"
  description = "Aselo Development Version of the Wechat Bot."
  name        = "AseloDevSurveyBot"
}