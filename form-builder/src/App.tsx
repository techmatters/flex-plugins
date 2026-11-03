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

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { DefinitionFiles, HelplineSummary } from '../server/definitionsApi';
import type { Me } from '../server/api';
import { fetchBranches, fetchDefinitionFiles, fetchHelplines } from './api';
import { ImportForms } from './components/ImportForms';
import { Loading } from './components/Loading';
import { isSignInEnabled, signOut } from './auth';
import { DraftClient, httpDraftClient } from './draftClient';
import { HelplineWorkspace } from './components/HelplineWorkspace';
import { AseloBuilderLogo } from './components/AseloBuilderLogo';
import { DraftsList } from './components/DraftsList';
import { FlowsArea } from './flows/FlowsArea';
import { RoutingArea } from './routing/RoutingArea';
import type { RoutingClient } from './routing/routingClient';
import { ChatbotsArea } from './chatbots/ChatbotsArea';
import type { ChatbotClient } from './chatbots/chatbotClient';
import { BoardClient, httpBoardClient } from './flows/boardClient';

type Area = 'forms' | 'flows' | 'routing' | 'chatbots';

const AREA_LABELS: Record<Area, string> = {
  forms: 'Forms',
  flows: 'Contact flows',
  routing: 'Routing',
  chatbots: 'Chatbots',
};

const areaFromUrl = (): Area => {
  const area = new URLSearchParams(window.location.search).get('area');
  return area === 'flows' || area === 'routing' || area === 'chatbots' ? area : 'forms';
};

type Props = {
  draftClient?: DraftClient;
  boardClient?: BoardClient;
  routingClient?: RoutingClient;
  chatbotClient?: ChatbotClient;
};

export const App = ({ draftClient = httpDraftClient, boardClient, routingClient, chatbotClient }: Props) => {
  // Forms, or the flow designer (Contact flows)
  const [area, setArea] = useState<Area>(areaFromUrl);
  const [user, setUser] = useState<Me>();
  const [helplines, setHelplines] = useState<HelplineSummary[]>([]);
  const [code, setCode] = useState('');
  const [version, setVersion] = useState('');
  // The forms open (chosen in the list): their helpline, version, and the flex-plugins branch they're
  // read from ('' for the default; a version imported from a branch, ImportForms)
  const [branch, setBranch] = useState('');
  // Bumped to list the drafts again (after an import)
  const [draftsCount, setDraftsCount] = useState(0);
  const [definitions, setDefinitions] = useState<DefinitionFiles>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  // Bumped to load the helpline again (after applying, or when someone else changed the draft)
  const [reloadCount, setReloadCount] = useState(0);
  // The flow designer's people lists, for who a form comment is for (stable, so it loads once)
  const loadPeople = useCallback((list: string) => (boardClient ?? httpBoardClient).people(list), [boardClient]);
  // Aselo staff can see the app as helpline staff do
  const [viewAsHelplineStaff, setViewAsHelplineStaff] = useState(false);

  const isAseloStaff = user?.role === 'aselo-staff';
  const actingAsStaff = isAseloStaff && !viewAsHelplineStaff;

  useEffect(() => {
    Promise.all([draftClient.me(), fetchHelplines()])
      .then(([me, loadedHelplines]) => {
        setUser(me);
        setHelplines(loadedHelplines);
      })
      .catch((err: Error) => setError(err.message));
  }, [draftClient]);

  useEffect(() => {
    if (!code || !version) return;
    setLoading(true);
    setError(undefined);
    setDefinitions(undefined);
    fetchDefinitionFiles(code, version, branch)
      .then(setDefinitions)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [code, version, branch, reloadCount]);

  // Areas opened stay as they were left (hidden, not closed): e.g. add a skill in Routing and go
  // back to the board being worked on. Each has its own way back to its start page.
  const [opened, setOpened] = useState<Set<Area>>(() => new Set([areaFromUrl()]));

  const switchArea = (newArea: Area) => {
    setArea(newArea);
    setOpened((current) => (current.has(newArea) ? current : new Set(current).add(newArea)));
    const params = new URLSearchParams(window.location.search);
    params.set('area', newArea);
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Forms' start page: the list, the helpline closed
  const closeHelpline = () => {
    setBranch('');
    setCode('');
    setVersion('');
    setDefinitions(undefined);
  };

  return (
    <div className={area === 'forms' ? 'app' : `app app-${area}`}>
      <header className="top-bar">
        <h1>
          <AseloBuilderLogo />
        </h1>
        <nav className="area-switch" aria-label="Area">
          {(['forms', 'flows', 'routing', 'chatbots'] as Area[]).map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={area === candidate ? 'active' : ''}
              aria-current={area === candidate ? 'page' : undefined}
              onClick={() => switchArea(candidate)}
            >
              {AREA_LABELS[candidate]}
            </button>
          ))}
        </nav>
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
              onChange={(e) => setViewAsHelplineStaff(e.target.checked)}
            />
            View as helpline staff
          </label>
        )}
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {opened.has('chatbots') && user && (
        <div className="area-pane" hidden={area !== 'chatbots'}>
          <ChatbotsArea
            client={chatbotClient}
            helplineCodes={helplines.map((helpline) => helpline.code)}
            staffMode={actingAsStaff}
            userName={user.name}
          />
        </div>
      )}

      {opened.has('routing') && user && (
        <div className="area-pane" hidden={area !== 'routing'}>
          <RoutingArea
            client={routingClient}
            helplineCodes={helplines.map((helpline) => helpline.code)}
            staffMode={actingAsStaff}
          />
        </div>
      )}

      {opened.has('flows') && user && (
        <div className="area-pane" hidden={area !== 'flows'}>
          <FlowsArea
            client={boardClient}
            helplineCodes={helplines.map((helpline) => helpline.code)}
            staffMode={actingAsStaff}
            userName={user.name}
            userEmail={user.email}
            active={area === 'flows'}
          />
        </div>
      )}

      <div className="area-pane" hidden={area !== 'forms'}>
        {code && (
          <div className="area-back-bar">
            <button type="button" className="link-button area-back" onClick={closeHelpline}>
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
            {user && actingAsStaff && (
              <ImportForms
                draftClient={draftClient}
                helplineCodes={helplines.map((helpline) => helpline.code)}
                loadBranches={fetchBranches}
                loadHelplines={fetchHelplines}
                onImported={() => setDraftsCount((count) => count + 1)}
              />
            )}
            {user && (
              <DraftsList
                key={draftsCount}
                draftClient={draftClient}
                isAseloStaff={isAseloStaff}
                onOpen={(draftCode, draftVersion, draftBranch) => {
                  setBranch(draftBranch);
                  setCode(draftCode);
                  setVersion(draftVersion);
                }}
              />
            )}
          </main>
        )}

        {loading && (
          <main className="empty-state">
            <Loading text="Loading forms…" />
          </main>
        )}

        {definitions && user && (
          <HelplineWorkspace
            key={`${definitions.source?.branch ?? ''}/${definitions.code}/${definitions.version}/${reloadCount}`}
            definitions={definitions}
            staffMode={actingAsStaff}
            canApply={actingAsStaff}
            applyInBuilder={user?.applyInBuilder !== false && !definitions.source}
            draftClient={draftClient}
            onReload={() => setReloadCount((count) => count + 1)}
            userName={user.name}
            loadPeople={loadPeople}
          />
        )}
      </div>
    </div>
  );
};
