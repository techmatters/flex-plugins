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
import { DefinitionVersion, loadDefinition } from '@tech-matters/hrm-form-definitions';
import { AccountSID } from '../twilioTypes';
import { retrieveServiceConfigurationAttributes } from '../configuration/aseloConfiguration';
import { getTwilioClient } from '../configuration/twilioConfiguration';

const getHelplineCodeFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'demo-v1') return 'as';
  if (definitionVersionId === 'v1') return 'zm';

  return definitionVersionId.split('-')[0];
};

const getVersionFromDefinitionVersionId = (definitionVersionId: string) => {
  if (definitionVersionId === 'v1') return 'v1';

  return definitionVersionId.substring(definitionVersionId.length - 2);
};

const getFormDefinitionUrl = ({
  assetsBucketUrl,
  definitionVersion,
}: {
  assetsBucketUrl: string;
  definitionVersion: string;
}) => {
  const helplineCode = getHelplineCodeFromDefinitionVersionId(definitionVersion);
  const version = getVersionFromDefinitionVersionId(definitionVersion);
  return `${assetsBucketUrl}/form-definitions/${helplineCode}/${version}`;
};

export const loadedDefinitionVersions: Record<string, DefinitionVersion> = {};

export const getDefinitionVersion = async ({
  assetsBucketUrl,
  definitionVersion,
}: {
  assetsBucketUrl: string;
  definitionVersion: string;
}): Promise<DefinitionVersion> => {
  const formDefinitionRootUrlString = getFormDefinitionUrl({
    assetsBucketUrl,
    definitionVersion,
  });
  if (!loadedDefinitionVersions[formDefinitionRootUrlString]) {
    console.debug('Loading forms at:', formDefinitionRootUrlString);
    loadedDefinitionVersions[formDefinitionRootUrlString] = await loadDefinition(
      formDefinitionRootUrlString,
    );
  }
  return loadedDefinitionVersions[formDefinitionRootUrlString];
};
/**
 * This function is used to clear the cache of loaded config jsons.
 * This is used for testing purposes.
 */
export const clearDefinitionCache = () => {
  Object.keys(loadedDefinitionVersions).forEach(key => {
    delete loadedDefinitionVersions[key];
  });
};

export const getCurrentDefinitionVersion = async ({
  accountSid,
}: {
  accountSid: AccountSID;
}): Promise<DefinitionVersion> => {
  const { assets_bucket_url: assetsBucketUrl, definitionVersion } =
    await retrieveServiceConfigurationAttributes(await getTwilioClient(accountSid));
  const currentDefinitionVersion = await getDefinitionVersion({
    assetsBucketUrl,
    definitionVersion,
  });
  console.log('>>>> currentDefinitionVersion', currentDefinitionVersion);
  return currentDefinitionVersion;
};

export const lookupCustomMessage = async (
  accountSid: AccountSID,
  locale: string,
  translationKey: string,
) => {
  console.log('>>>> accountSid', accountSid);
  console.log('>>>> locale', locale);
  console.log('>>>> translationKey', translationKey);
  const { customStrings } = await getCurrentDefinitionVersion({ accountSid });
  console.log('>>>> customStrings', customStrings);
  if (customStrings) {
    const customMessageForLocale = customStrings.Messages.EndChatMsg[locale];
    if (customMessageForLocale) {
      return customMessageForLocale;
    }
    const [language] = locale.split('-');
    if (language) {
      const customMessageForLanguage = customStrings.Messages[translationKey]?.[language];
      if (customMessageForLanguage) {
        return customMessageForLanguage;
      }
    }
  }
  return undefined;
};
