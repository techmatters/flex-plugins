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

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initAuth } from './auth';
import './styles.css';

const root = createRoot(document.getElementById('root')!);

// Deployed, sign in with Okta first (see auth.ts); locally this renders straight away
initAuth().then(
  (ready) => {
    if (ready) {
      root.render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
    }
  },
  (err) => {
    root.render(
      <p className="sign-in-error">
        {(err as Error).message} <a href="/">Try again</a>
      </p>,
    );
  },
);
