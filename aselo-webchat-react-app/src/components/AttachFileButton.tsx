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

import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@twilio-paste/core/button";
import { AttachIcon } from "@twilio-paste/icons/esm/AttachIcon";

import { AppState } from "../store/definitions";
import { hiddenInputStyles } from "./styles/AttachFileButton.styles";
import { validateFiles } from "../utils/file";
import { attachFiles } from "../store/actions/genericActions";

export const AttachFileButton = ({ textAreaRef }: { textAreaRef?: React.RefObject<HTMLTextAreaElement> }) => {
    const fileInputRef: React.RefObject<HTMLInputElement> = useRef(null);
    const { attachedFiles, fileAttachmentConfig } = useSelector((state: AppState) => ({
        attachedFiles: state.chat.attachedFiles || [],
        fileAttachmentConfig: state.config.fileAttachment
    }));

    const dispatch = useDispatch();

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files && Array.from(event.target.files);
        if (selectedFiles) {
            const validFiles = validateFiles(selectedFiles, dispatch, attachedFiles, fileAttachmentConfig);
            dispatch(attachFiles(validFiles));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        textAreaRef?.current?.focus();
    };

    return (
        <Button variant="secondary_icon" size="icon_small" onClick={() => fileInputRef.current?.click()}>
            <input
                style={hiddenInputStyles}
                onChange={onFileChange}
                type="file"
                accept={
                    fileAttachmentConfig?.acceptedExtensions &&
                    fileAttachmentConfig.acceptedExtensions.map((e) => `.${e}`).join(",")
                }
                ref={fileInputRef}
                multiple
            />
            <AttachIcon decorative={false} title="Add file attachment" />
        </Button>
    );
};
