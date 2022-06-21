/**
 * If changes are made to this file, it needs to be recompiled using @vercel/ncc (https://github.com/vercel/ncc).
 * 1) Install vercel/ncc by running this command in your terminal. npm i -g @vercel/ncc
 * 2) Compile your index.js file. ncc build index.js --license licenses.txt
 * For details see https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github 
 */ 

// import { setOutput, setFailed } from '@actions/core';
import packageLock from '../../../plugin-hrm-form/package-lock.json';

const uiVersion = packageLock.dependencies['@twilio/flex-ui'];
if (uiVersion) {
  console.log(`flex ui version: ${uiVersion}`);
  // setOutput(`flex ui version: ${uiVersion}`, true);
} else {
  console.log('Flex ui version not found');
  // setFailed('Flex ui version not found');
}
 