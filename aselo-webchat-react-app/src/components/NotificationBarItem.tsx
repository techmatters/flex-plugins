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

import { Text } from "@twilio-paste/core/text";
import { Alert } from "@twilio-paste/core/alert";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { Notification } from "../store/definitions";
import { removeNotification } from "../store/actions/genericActions";

export const NotificationBarItem = ({ dismissible, id, message, onDismiss, timeout, type }: Notification) => {
    const dispatch = useDispatch();

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (timeout) {
            timer = setTimeout(() => {
                dispatch(removeNotification(id));
                if (onDismiss) {
                    onDismiss();
                }
            }, timeout);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [dispatch, timeout, id, onDismiss]);

    const dismissNotification = () => {
        if (onDismiss) {
            onDismiss();
        }
        dispatch(removeNotification(id));
    };

    return (
        <Alert
            role="status"
            aria-live="polite"
            variant={type}
            onDismiss={dismissible ? dismissNotification : undefined}
            data-test="alert-message"
        >
            <Text data-test="alert-message-text" as="span">
                {message}
            </Text>
        </Alert>
    );
};
