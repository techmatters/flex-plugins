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

import { Box } from "@twilio-paste/core/box";
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon";
import { ChevronDownIcon } from "@twilio-paste/icons/esm/ChevronDownIcon";
import { useDispatch, useSelector } from "react-redux";

import { changeExpandedStatus } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";
import { containerStyles } from "./styles/EntryPoint.styles";

export const EntryPoint = () => {
    const dispatch = useDispatch();
    const expanded = useSelector((state: AppState) => state.session.expanded);

    return (
        <Box
            as="button"
            data-test="entry-point-button"
            onClick={() => dispatch(changeExpandedStatus({ expanded: !expanded }))}
            {...containerStyles}
        >
            {expanded ? (
                <ChevronDownIcon decorative={false} title="Minimize chat" size="sizeIcon80" />
            ) : (
                <ChatIcon decorative={false} title="Open chat" size="sizeIcon60" />
            )}
        </Box>
    );
};
