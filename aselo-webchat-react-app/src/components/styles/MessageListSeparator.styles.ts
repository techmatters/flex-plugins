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

import { SeparatorType } from "../definitions";

export const separatorContainerStyles: BoxStyleProps = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "space30",
    marginBottom: "space60"
};

export const getSeparatorLineStyles = (separatorType: SeparatorType): BoxStyleProps => ({
    flex: "1",
    borderStyle: "solid",
    borderColor: separatorType === "new" ? "colorBorderError" : "colorBorderWeak",
    borderWidth: "borderWidth0",
    borderTopWidth: "borderWidth10"
});

export const getSeparatorTextStyles = (separatorType: SeparatorType): TextStyleProps => ({
    fontSize: "fontSize20",
    marginLeft: "space40",
    marginRight: "space40",
    color: separatorType === "new" ? "colorTextError" : "colorText"
});
