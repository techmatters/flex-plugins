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

import { useCallback, useEffect } from 'react';
import { ArrowLeft, CircleHelp } from 'lucide-react';

import { ImportForms } from '../drafts/ImportForms';
import { Loading } from '../common/Loading';
import { isSignInEnabled, signOut } from './auth';
import { useAppDispatch, useAppSelector } from './store';
import {
  loadSession,
  selectIsAseloStaff,
  selectActingAsStaff,
  selectUser,
  viewAsHelplineStaffSet,
} from './sessionSlice';
import { AREA_LABELS, AREAS, helpToggled, openHelp, selectApp, switchArea } from './appSlice';
import { HelplineWorkspace } from '../workspace/HelplineWorkspace';
import { closeHelpline, selectWorkspace } from '../workspace/workspaceSlice';
import { AseloBuilderLogo } from './AseloBuilderLogo';
import { DraftsList } from '../drafts/DraftsList';
import { FlowsArea } from '../flows/FlowsArea';
import { RoutingArea } from '../routing/RoutingArea';
import { ChatbotsArea } from '../chatbots/ChatbotsArea';
import { HelpPanel } from '../help/HelpPanel';
import { HelpContext } from '../help/HelpContext';
import { Tour } from '../help/Tour';

// eslint-disable-next-line complexity, sonarjs/cognitive-complexity
export const App = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAseloStaff = useAppSelector(selectIsAseloStaff);
  // Aselo staff can see the app as helpline staff do
  const actingAsStaff = useAppSelector(selectActingAsStaff);
  const { viewAsHelplineStaff, error: sessionError } = useAppSelector(state => state.session);
  // The forms open (chosen in the list): their helpline, and its files once loaded
  const { code, definitions, loading, error: helplineError } = useAppSelector(selectWorkspace);
  const { area, opened, helpOpen, tour } = useAppSelector(selectApp);
  const error = sessionError ?? helplineError;

  // Stable, as "Need help?" keeps it
  const requestHelp = useCallback((slug?: string) => dispatch(openHelp(slug)), [dispatch]);

  useEffect(() => {
    dispatch(loadSession());
  }, [dispatch]);

  return (
    <HelpContext.Provider value={requestHelp}>
      <div className={`${area === 'forms' ? 'app' : `app app-${area}`}${helpOpen ? ' help-open' : ''}`}>
        <header className="top-bar">
          <h1>
            <AseloBuilderLogo />
          </h1>
          <nav className="area-switch" aria-label="Area">
            {AREAS.map(candidate => (
              <button
                key={candidate}
                type="button"
                className={area === candidate ? 'active' : ''}
                aria-current={area === candidate ? 'page' : undefined}
                onClick={() => dispatch(switchArea(candidate))}
              >
                {AREA_LABELS[candidate]}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="top-bar-help"
            aria-expanded={helpOpen}
            title="Guides, and answers to your questions"
            onClick={() => dispatch(helpToggled())}
          >
            <CircleHelp size={15} aria-hidden /> Help
          </button>
          <span className="top-bar-user">
            {user && (
              <>
                {user.name} · {isAseloStaff ? 'Aselo staff' : 'Helpline staff'}
                {isSignInEnabled() && (
                  <>
                    {' · '}
                    <button type="button" className="link-button" onClick={signOut}>
                      Sign out
                    </button>
                  </>
                )}
              </>
            )}
          </span>
          {isAseloStaff && (
            <label className="staff-toggle" title="See and use the app as helpline staff do">
              <input
                type="checkbox"
                checked={viewAsHelplineStaff}
                onChange={e => dispatch(viewAsHelplineStaffSet(e.target.checked))}
              />
              View as helpline staff
            </label>
          )}
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        {helpOpen && <HelpPanel />}
        {tour?.tour && <Tour key={tour.slug} />}

        {opened.includes('chatbots') && user && (
          <div className="area-pane" hidden={area !== 'chatbots'}>
            <ChatbotsArea />
          </div>
        )}

        {opened.includes('routing') && user && (
          <div className="area-pane" hidden={area !== 'routing'}>
            <RoutingArea />
          </div>
        )}

        {opened.includes('flows') && user && (
          <div className="area-pane" hidden={area !== 'flows'}>
            <FlowsArea />
          </div>
        )}

        <div className="area-pane" hidden={area !== 'forms'}>
          {code && (
            <div className="area-back-bar">
              <button type="button" className="link-button area-back" onClick={() => dispatch(closeHelpline())}>
                <ArrowLeft size={14} aria-hidden /> All forms
              </button>
            </div>
          )}

          {!code && !error && (
            <main className="area-home forms-home">
              <h2>Forms</h2>
              <p className="field-hint area-home-intro">
                The forms counselors fill in for each contact and case, the webchat form, and how contacts are filled in
                from the chatbot. Open one from the list to see and edit it.
              </p>
              {!user && <Loading text="Loading helplines…" />}
              {user && actingAsStaff && <ImportForms />}
              {user && <DraftsList />}
            </main>
          )}

          {loading && (
            <main className="empty-state">
              <Loading text="Loading forms…" />
            </main>
          )}

          {definitions && user && (
            // Reloading starts it again (the workspace slice's editorRevision restarts the editors)
            <HelplineWorkspace key={`${definitions.source?.branch ?? ''}/${definitions.code}/${definitions.version}`} />
          )}
        </div>
      </div>
    </HelpContext.Provider>
  );
};
