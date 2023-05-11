resource "aws_lex_slot_type" "caller_types" {
  description   = "Caller is calling for self or not"
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

resource "aws_lex_slot_type" "age" {
  description    = "Caller's age"
  version        = "$LATEST"

  enumeration_value {
    synonyms = [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
      "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"
    ]

    value = "21 and Below"
  }

  enumeration_value {
    synonyms = [
      "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", 
      "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", 
      "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", 
      "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", 
      "62", "63", "64", "65", "66", "67", "68", "69", "70", "71",
      "72", "73", "74", "75", "76", "77", "78", "79", "80", "81",
      "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", 
      "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", 
      "102", "103", "104", "105", "106", "107", "108", "109", "110"
    ]

    value = "Above 21"
  }

  enumeration_value {
    value = "X"
  }

  enumeration_value {
    value = "prefer not to answer"
  }

  name                     = "Age"
  value_selection_strategy = "ORIGINAL_VALUE"
}

resource "aws_lex_slot_type" "gender" {
  description   = "Caller's gender"
  version       = "$LATEST"

  enumeration_value {
    synonyms = [
      "M",
      "Dude",
      "Guy",
      "Man",
      "He",
      "Male"
    ]

    value = "Boy"
  }

  enumeration_value {
    synonyms = [
      "Woman",
      "Lady",
      "Female",
      "She",
      "F"
    ]

    value = "Girl"
  }

  enumeration_value {
    synonyms = [
      "None",
      "Non binary",
    ]

    value = "Non-Binary"
  }

  enumeration_value {
    synonyms = [
      "X",
      "not sure",
      "Unsure"
    ]

    value = "Unknown"
  }

  enumeration_value {
    value = "prefer not to answer"
  }

  name                     = "Gender"
  value_selection_strategy = "ORIGINAL_VALUE"
}



