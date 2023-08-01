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

// eslint-disable-next-line import/no-extraneous-dependencies
import { Page, expect } from '@playwright/test';

export const referableResources = (page: Page) => {
  const selectors = {
    referableResourcesSideLink: page.locator(
      `//button[@data-testid='referrable-resources-side-link']`,
    ),
    agentDesktopSideLink: page.locator(`button[aria-label='Agent Desktop']`),
    resourcesSearchTitle: page.locator(`//p[@data-testid='Resources-Search-Title']`),
    searchInput: page.locator('input#search-input'),
    searchButton: page.locator(`//button[@data-testid='search-button']`),
    firstResource: page.locator(`//button[@data-testid='resource-name']`).first(),
    resourceInfo: {
      title: page.locator(`//p[@data-testid='resource-title']`),
      website: page.locator(`//p[@data-testid='resource-website']`),
    },
    copyIdButton: page.locator(`//button[@data-testid='copy-id-button']`),
    addResource: {
      input: page.locator(`//input[@data-testid='add-resource-input']`),
      button: page.locator(`//button[@data-testid='add-resource-button']`),
      firstItem: page.locator(`//li[@data-testid='added-resource-item']`).first(),
    },
  };

  const openReferrableResources = async () => {
    const { referableResourcesSideLink } = selectors;
    await referableResourcesSideLink.waitFor({ state: 'visible' });
    await referableResourcesSideLink.click();
    const referrableResourcesRegex = /\/referrable-resources\//;
    await page.waitForURL(referrableResourcesRegex);
  };

  const openAgentDesktop = async () => {
    const { agentDesktopSideLink } = selectors;
    await agentDesktopSideLink.waitFor({ state: 'visible' });
    await agentDesktopSideLink.click();
    const agentDesktopRegex = /\/agent-desktop\//;
    await page.waitForURL(agentDesktopRegex);
  };

  const searchResources = async (searchTerm: string) => {
    const { searchInput, searchButton } = selectors;
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill(searchTerm);
    await searchButton.waitFor({ state: 'visible' });
    await searchButton.click();
  };

  const selectFirstResource = async () => {
    const { firstResource, resourceInfo } = selectors;
    await firstResource.waitFor({ state: 'visible' });
    await firstResource.click();
    await resourceInfo.title.waitFor({ state: 'visible' });
  };

  const verifyTitle = async (title: string) => {
    const { resourceInfo } = selectors;
    await resourceInfo.title.waitFor({ state: 'visible' });
    await expect(resourceInfo.title).toContainText(title);
  };

  const verifyWebsite = async (website: string) => {
    const { resourceInfo } = selectors;
    await resourceInfo.website.waitFor({ state: 'visible' });
    await expect(resourceInfo.website).toContainText(website);
  };

  const copyId = async () => {
    const { copyIdButton } = selectors;
    await copyIdButton.waitFor({ state: 'visible' });
    await copyIdButton.click();
  };

  const addResourceToContact = async () => {
    const { input, button, firstItem } = selectors.addResource;
    await input.waitFor({ state: 'visible' });
    const idFromClipBoard = await page.evaluate<string>('navigator.clipboard.readText()');
    await input.fill(idFromClipBoard);
    await button.waitFor({ state: 'visible' });
    await button.click();
    await firstItem.waitFor({ state: 'visible' });
  };

  return {
    openReferrableResources,
    openAgentDesktop,
    searchResources,
    selectFirstResource,
    verifyTitle,
    verifyWebsite,
    copyId,
    addResourceToContact,
  };
};
