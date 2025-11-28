/**
 * Copyright (C) 2021-2023 Technology Matters
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

/* eslint-disable react/require-default-props */
import React, { useState } from "react";
import { Button } from "@twilio-paste/core/button";
import { useDispatch } from "react-redux";

import { finishChatTask } from "./end-chat-service";
import { sessionDataHandler } from "../../sessionDataHandler";
import { changeEngagementPhase, updatePreEngagementData } from "../../store/actions/genericActions";
import { EngagementPhase } from "../../store/definitions";

type Props = {
    channelSid: string;
    token: string;
    language?: string;
    action: "finishTask" | "restartEngagement";
};

export default function EndChat({ channelSid, token, language, action }: Props) {
    const [disabled, setDisabled] = useState(false);
    const dispatch = useDispatch();

    // Serverless call to end chat
    const handleEndChat = async () => {
        switch (action) {
            case "finishTask":
                try {
                    setDisabled(true);
                    await finishChatTask(channelSid, token, language);
                } catch (error) {
                    console.log(error);
                } finally {
                    setDisabled(false);
                }
                return;
            case "restartEngagement":
            default:
                sessionDataHandler.clear();
                dispatch(updatePreEngagementData({ email: "", name: "", query: "" }));
                dispatch(changeEngagementPhase({ phase: EngagementPhase.PreEngagementForm }));
        }
    };
    return (
        <Button variant="destructive" onClick={handleEndChat} disabled={disabled}>
            <span>CloseLarge</span>
            <span>EndChatButtonLabel</span>
        </Button>
    );
}
