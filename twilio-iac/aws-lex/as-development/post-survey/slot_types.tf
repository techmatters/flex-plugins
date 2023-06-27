resource "aws_lex_slot_type" "yes_no" {
  description   = "Yes/No option"
  version       = "$LATEST"

  enumeration_value {
    synonyms = [
      "Y",
      "Ya",
      "Yah",
      "Yeah"
    ]

    value = "Yes"
  }

  enumeration_value {
    synonyms = [
      "N",
      "Na",
      "Nah",
      "Noo"
    ]

    value = "No"
  }

  name                     = "CallerTypes"
  value_selection_strategy = "ORIGINAL_VALUE"
}