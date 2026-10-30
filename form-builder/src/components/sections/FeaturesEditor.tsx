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

/**
 * Helpline features: switched on or off by Aselo staff; helpline staff see what's on.
 */
import type { DefinitionFileMap } from '../../definitions';
import { FEATURE_INFO, getFeatures, getPermissionConfig, setFeature } from '../../helplineFeatures';
import type { ConfigObject } from '../../serviceConfig';

type Props = {
  draftFiles: DefinitionFileMap;
  originalFiles: DefinitionFileMap;
  // Aselo staff (not just viewing as helpline staff)
  canChange: boolean;
  // Aselo’s shared service configuration defaults
  defaults?: ConfigObject;
  onChangeFiles: (updater: (current: DefinitionFileMap) => DefinitionFileMap) => void;
};

export const FeaturesEditor = ({ draftFiles, originalFiles, canChange, defaults, onChangeFiles }: Props) => {
  const features = getFeatures(draftFiles, defaults);
  const original = getFeatures(originalFiles, defaults);
  const permissionConfig = getPermissionConfig(draftFiles, defaults);

  return (
    <section className="panel features-panel">
      <h2>Helpline features</h2>
      <p className="muted">
        {canChange
          ? 'Switch features on or off for counselors. These are settings in the helpline’s service configuration (see Service configuration for everything, per environment); after the PR is merged, apply the service configuration to staging and production.'
          : 'What’s switched on for your counselors. To change any of these, contact the Aselo team.'}
      </p>
      {!features ? (
        <p className="muted">This helpline’s Flex service configuration wasn’t found.</p>
      ) : (
        <ul className="feature-list">
          {FEATURE_INFO.map((info) => (
            <li key={info.key}>
              <label className="feature-switch">
                <input
                  type="checkbox"
                  role="switch"
                  checked={features[info.key]}
                  disabled={!canChange}
                  onChange={(e) =>
                    onChangeFiles((files) => setFeature(files, info.key, e.target.checked))
                  }
                />
                <span>
                  <strong>{info.title}</strong>
                  {original && original[info.key] !== features[info.key] && (
                    <span className="badge badge-edited">Changed</span>
                  )}
                  <span className="field-hint">{info.description}</span>
                </span>
              </label>
            </li>
          ))}
          <li>
            <div className="feature-switch">
              <span className="feature-fixed" aria-hidden="true">
                —
              </span>
              <span>
                <strong>Cases</strong>
                <span className="field-hint">
                  What counselors can do with cases (open, edit, close, reopen) is set by Aselo’s
                  permission rules{permissionConfig ? ` (“${permissionConfig}”)` : ''}, not here.
                  Contact the Aselo team to change them.
                </span>
              </span>
            </div>
          </li>
        </ul>
      )}
    </section>
  );
};
