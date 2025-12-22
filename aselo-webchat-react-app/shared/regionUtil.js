/**
 * Copyright (C) 2021-2026 Technology Matters
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */

function parseRegionForHTTP(region) {
    switch (region) {
        case "prod":
        case "us1":
        case "":
        case undefined:
        case null:
            return "";
        case "dev-us1":
          return ".dev";
        case "stage-us1":
          return ".stage";
        default:
            return `.${region}`;
    }
}

function parseRegionForEventBridge(region) {
    switch (region) {
        case "prod":
        case "":
        case "us1":
        case undefined:
        case null:
            return "";
        case "stage":
            return ".stage-us1";
        case "dev":
            return ".dev-us1";
        default:
            return `.${region}`;
    }
}

function parseRegionForTwilioClient(region) {
    switch (region) {
        case "prod":
        case "us1":
        case undefined:
        case null:
            return "";
        case "stage-us1":
            return "stage";
        case "dev-us1":
            return "dev";
        default:
            return region;
    }
}
function parseRegionForConversations(region) {
    region = region || "";
    switch (region) {
        case "prod":
        case "":
        case undefined:
        case null:
            return "us1";
        case "dev":
            return "dev-us1";
        case "stage":
            return "stage-us1";
        default:
            return `${region}`;
    }
}

module.exports = {
    parseRegionForHTTP,
    parseRegionForTwilioClient,
    parseRegionForEventBridge,
    parseRegionForConversations
};
