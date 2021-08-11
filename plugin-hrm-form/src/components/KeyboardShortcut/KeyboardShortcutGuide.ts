/**
 * This part is completely hardcoded and centralized.
 * Should we make it more dynamically, in a way that we wouldn't
 * need this file at all?
 *
 * For example: When calling the addShorcut() method, we could pass its description as a parameter.
 * That way it will be easier to keep the keyboard guide up to date. And the 'keys' part could be
 * built automatically filled (or overwritten if necessary for accessibility reasons).
 */
export const keyboardGuide = [
  { description: 'Toggle keyboard guide', keys: '?' },
  { description: 'Toggle sidebar', keys: 'M' },
  { description: 'Toggle availability', keys: 'O' },
  { description: 'Open standalone search', keys: 'S' },
  { description: 'Open agent desktop', keys: 'A' },
  { description: 'Choose Tab', keys: '0/1/2/3/4 (tab number)' },
];
