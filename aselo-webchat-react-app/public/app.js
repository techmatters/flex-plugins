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

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const theme = urlParams.get("theme") || document.currentScript?.getAttribute('theme');
  const isLightTheme = theme !== "dark";
  const alwaysOpen = urlParams.get("alwaysOpen");
  const defaultLocale = urlParams.get("locale");
  const el = document.querySelector("[data-theme-pref]");
  el && el.setAttribute("data-theme-pref", isLightTheme ? "light-theme" : "dark-theme");

  Twilio.initLogger("info");
  Twilio.initWebchat(urlParams.get('configUrl') || document.currentScript?.getAttribute('config-url'), {
    ...(theme ? { theme: { isLight: isLightTheme } } : {}),
    ...(alwaysOpen ? { alwaysOpen: alwaysOpen.toLowerCase() === 'true' } : {}),
    ...(defaultLocale ? { defaultLocale } : {})
  });
});
