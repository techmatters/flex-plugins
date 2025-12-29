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
  const isLightTheme = urlParams.get("theme") !== "dark";
  const el = document.querySelector("[data-theme-pref]");

  el && el.setAttribute("data-theme-pref", isLightTheme ? "light-theme" : "dark-theme");

  Twilio.initLogger("info");
  Twilio.initWebchat({
    deploymentKey: urlParams.get("deploymentKey"),
    region: urlParams.get("region"),
    appStatus: 'open',
    theme: {
      isLight: isLightTheme
    }
  })
});
