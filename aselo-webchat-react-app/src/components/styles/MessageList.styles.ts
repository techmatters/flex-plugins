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

import { BoxStyleProps } from "@twilio-paste/core/box";
import { TextStyleProps } from "@twilio-paste/core/text";

import { MESSAGES_SPINNER_BOX_HEIGHT } from "../../constants";

export const messageListStyles: BoxStyleProps = {
    flexGrow: 1,
    justifyContent: "flex-end",
    overflow: "auto",
    display: "flex",
    flexDirection: "column-reverse"
};

export const outerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column-reverse",
    flex: "1",
    marginTop: "auto",
    overflow: "auto"
};

export const innerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    padding: "space40",
    flex: 1
};

export const spinnerContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: `${MESSAGES_SPINNER_BOX_HEIGHT}px`
};

export const participantTypingStyles: TextStyleProps = {
    fontSize: "fontSize10",
    fontStyle: "italic",
    color: "colorTextWeak",
    marginTop: "auto"
};

export const conversationEventContainerStyles: BoxStyleProps = {
    textAlign: "center",
    marginTop: "space40",
    marginBottom: "space60"
};

export const conversationEventTitleStyles: TextStyleProps = {
    fontSize: "fontSize20"
};

export const conversationEventDateStyles: TextStyleProps = {
    fontSize: "fontSize20",
    fontStyle: "textStyleItalic",
    color: "colorTextWeak"
};
