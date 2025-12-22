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

export const outerContainerStyles: BoxStyleProps = {
    position: "fixed",
    bottom: "space50",
    right: "space60",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
};

export const innerContainerStyles: BoxStyleProps = {
    boxShadow: "shadow",
    display: "flex",
    flexDirection: "column",
    width: "320px",
    height: "590px",
    marginBottom: "space50",
    borderRadius: "borderRadius30",
    backgroundColor: "colorBackgroundBody"
};
