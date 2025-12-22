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

export class LocalStorageUtil {

    /**
     * Set value in localStorage
     *
     * @param {string} key
     * @param {string} value
     * @example
     *
     * LocalStorageUtil.set('test','val')
     */
    public static set(key: string, value: unknown): void {
        const stringifiedData = JSON.stringify(value);
        window.localStorage.setItem(key, stringifiedData);
    }

    /**
     * Get the value stored in the local storage for the given key
     *
     * @returns {string} value that was stored
     * @example
     *
     * let val = LocalStorageUtil.get('test')
     */
    public static get(key: string) {
        const data = window.localStorage.getItem(key);
        try {
            return data ? JSON.parse(data) : null;
        } catch(error) {
            return data;
        }
    }

    /**
     * Clear all records in the local storage
     *
     * @returns {void} Successfully removes the key from LocalStorage
     * @example
     *
     * LocalStorageUtil.remove('test))
     */
    public static remove(key: string): void {
        return window.localStorage.removeItem(key);
    }
}