// Copyright (C) 2021-2026 Technology Matters
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see https://www.gnu.org/licenses/.

locals {
  local_config = {
    studio_flows = {
      survey_en : {
        templatefile = "/app/twilio-iac/helplines/zz/templates/studio-flows/survey.tftpl"
        flow_vars = {
          assets_url      = "https://zz-recordings-1234.twil.io/en"
          gather_language = "en-US"
          thanks_text     = "Thank you for your answers."
        }
      },
      survey_es : {
        templatefile = "/app/twilio-iac/helplines/zz/templates/studio-flows/survey.tftpl"
        flow_vars = {
          assets_url      = "https://zz-recordings-1234.twil.io/es"
          gather_language = "es-US"
          thanks_text     = "Gracias por sus respuestas."
        }
      }
    }
  }
}
