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

export const formStyles: BoxStyleProps = {
    borderTopColor: "colorBorderWeaker",
    borderTopWidth: "borderWidth10",
    borderTopStyle: "solid",
    padding: "space20"
};

export const innerInputStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start"
};

export const textAreaContainerStyles: BoxStyleProps = {
    marginTop: "auto",
    marginBottom: "auto",
    flex: 1
};

export const messageOptionContainerStyles: BoxStyleProps = {
    margin: "space30",
    marginLeft: "space20",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "left",

    _notLast: {
        marginRight: "space0"
    }
};

export const filePreviewContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    maxHeight: "300px",
    position: "relative",
    paddingLeft: "space30",
    paddingRight: "space30"
};
