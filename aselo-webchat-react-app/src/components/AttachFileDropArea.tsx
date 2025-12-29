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

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { AttachIcon } from "@twilio-paste/icons/esm/AttachIcon";

import {
    attachIconContainerStyles,
    attachTitleStyles,
    containerStyles,
    dropAreaStyles
} from "./styles/AttachFileDropArea.styles";
import { validateFiles } from "../utils/file";
import { attachFiles } from "../store/actions/genericActions";
import { AppState } from "../store/definitions";

export const AttachFileDropArea = ({ children }: { children: React.ReactNode }) => {
    const { attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));

    const dispatch = useDispatch();

    const [isDragging, setIsDragging] = useState(false);

    const containsFile = (dataTransfer: DataTransfer): boolean =>
        Boolean(dataTransfer?.types?.find((dataTransferType) => dataTransferType === "Files"));

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();

        if (containsFile(event.dataTransfer)) {
            const { files } = event.dataTransfer;

            if (files && files.length) {
                const validFiles = validateFiles(Array.from(files), dispatch, attachedFiles, fileAttachmentConfig);
                dispatch(attachFiles(validFiles));
            }
        }

        setIsDragging(false);
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();

        if (isDragging) {
            return;
        }

        if (!containsFile(event.dataTransfer)) {
            return;
        }

        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();

        const relatedTarget = (event.nativeEvent as DragEvent).relatedTarget as Node;
        if (
            !relatedTarget ||
            // Prevent event from being fired when dragging over a child (or child ShadowDOM element)
            (!event.currentTarget.contains(relatedTarget) && !(relatedTarget.getRootNode() instanceof ShadowRoot))
        ) {
            setIsDragging(false);
        }
    };

    return (
        <Box {...containerStyles} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            {isDragging && (
                <Box {...dropAreaStyles}>
                    <Box {...attachIconContainerStyles}>
                        <AttachIcon decorative={true} size="sizeIcon60" />
                    </Box>
                    <Text as="p" {...attachTitleStyles}>
                        Drop a file or image here
                    </Text>
                </Box>
            )}
            {children}
        </Box>
    );
};
